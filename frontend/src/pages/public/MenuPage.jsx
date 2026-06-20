import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api, { createAbortController, isRequestCanceled, withAbortSignal } from "../../api/axios";
import OfflineBanner from "../../components/OfflineBanner";
import CategoryTabs from "../../components/public/CategoryTabs";
import ProductDetailSheet from "../../components/public/ProductDetailSheet";
import PublicEmptyState from "../../components/public/PublicEmptyState";
import PublicProductCard from "../../components/public/PublicProductCard";
import PublicShopHeader from "../../components/public/PublicShopHeader";
import { MenuPageSkeleton } from "../../components/public/PublicSkeletons";
import StickyCartBar from "../../components/public/StickyCartBar";
import { ErrorState, SectionTitle, toastError, toastSuccess } from "../../components/ui";
import useOnlineStatus from "../../hooks/useOnlineStatus";
import { mergeCartItem, readCart, writeCart } from "../../utils/cart";
import { getPreferredLocale, normalizeLocale, setPreferredLocale, t } from "../../utils/localization";
import { getPublicMenuCache, getPublicMenuCacheAge, publicMenuCacheKey, savePublicMenuCache } from "../../services/publicMenuCache";

export default function MenuPage() {
  const { shopSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLocale = normalizeLocale(searchParams.get("locale") || getPreferredLocale());
  const search = useMemo(() => {
    const next = new URLSearchParams(searchParams);
    next.set("locale", selectedLocale);

    return next.toString();
  }, [searchParams, selectedLocale]);
  const online = useOnlineStatus();
  const navigate = useNavigate();
  const cartContext = useMemo(() => ({
    shopSlug,
    branchId: searchParams.get("branch") || "",
    tableCode: searchParams.get("table") || "",
  }), [shopSlug, searchParams]);
  const [menu, setMenu] = useState(null);
  const [active, setActive] = useState("");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState(() => readCart(cartContext));
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [offlineCached, setOfflineCached] = useState(false);
  const [cacheAge, setCacheAge] = useState(null);

  useEffect(() => {
    if (searchParams.get("locale") !== selectedLocale) {
      const next = new URLSearchParams(searchParams);
      next.set("locale", selectedLocale);
      setSearchParams(next, { replace: true });
    }

    setPreferredLocale(selectedLocale);
  }, [searchParams, selectedLocale, setSearchParams]);

  useEffect(() => {
    const controller = createAbortController();
    const cacheKey = publicMenuCacheKey({
      shopSlug,
      branchId: searchParams.get("branch") || "",
      tableCode: searchParams.get("table") || "",
      locale: selectedLocale,
      search,
    });

    api
      .get(`/public/shops/${shopSlug}/menu?${search}`, withAbortSignal({}, controller.signal))
      .then((response) => {
        const data = response.data.data;
        setMenu(data);
        setActive(data.categories[0]?.id || "");
        savePublicMenuCache(cacheKey, data);
        setOfflineCached(false);
        setCacheAge(null);
        setError("");
      })
      .catch((requestError) => {
        if (isRequestCanceled(requestError)) {
          return;
        }

        const cached = getPublicMenuCache(cacheKey);

        if (cached) {
          setMenu(cached.data);
          setActive(cached.data.categories[0]?.id || "");
          setOfflineCached(true);
          setCacheAge(getPublicMenuCacheAge(cacheKey));
          setError("");
          return;
        }

        setError(!online
          ? t(selectedLocale, "offlineMissing")
          : requestError.response?.data?.message || "Menu is not available right now.");
      });

    return () => controller.abort();
  }, [shopSlug, search, online, selectedLocale, searchParams]);

  useEffect(() => {
    writeCart(cart, cartContext);
  }, [cart, cartContext]);

  const visibleCategories = useMemo(() => {
    if (!menu) return [];
    const normalizedQuery = query.trim().toLowerCase();

    return menu.categories
      .map((category) => ({
        ...category,
        products: (category.products || []).filter((product) => {
          if (!normalizedQuery) return true;
          return [product.name, product.description].filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery);
        }),
      }))
      .filter((category) => !normalizedQuery || category.products.length);
  }, [menu, query]);

  const categoryCounts = useMemo(() => Object.fromEntries((menu?.categories || []).map((category) => [
    category.id,
    (category.products || []).filter((product) => {
      const normalizedQuery = query.trim().toLowerCase();
      if (!normalizedQuery) return true;
      return [product.name, product.description].filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery);
    }).length,
  ])), [menu, query]);

  const featuredProducts = useMemo(() => {
    if (!menu) return [];

    return menu.categories
      .flatMap((category) => category.products || [])
      .filter((product) => product.is_featured && product.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 4);
  }, [menu, query]);

  const addConfiguredItem = (cartItem) => {
    setCart((items) => mergeCartItem(items, cartItem));
    toastSuccess(`${cartItem.name} ${t(selectedLocale, "addedToCart")}`);
  };

  const scrollToCategory = (categoryId) => {
    setActive(categoryId);
    document.getElementById(`category-${categoryId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const changeLocale = (locale) => {
    const nextLocale = setPreferredLocale(locale);
    const next = new URLSearchParams(searchParams);
    next.set("locale", nextLocale);
    setSearchParams(next);
  };

  if (error) {
    return (
      <div className="mx-auto min-h-screen max-w-5xl bg-slate-50" lang={selectedLocale}>
        {!online ? <OfflineBanner locale={selectedLocale} /> : null}
        <div className="p-4">
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="mx-auto min-h-screen max-w-5xl bg-slate-50" lang={selectedLocale}>
        {!online ? <OfflineBanner locale={selectedLocale} /> : null}
        <MenuPageSkeleton />
      </div>
    );
  }

  const checkoutParams = new URLSearchParams({
    shop: String(menu.shop.id),
    shop_slug: shopSlug,
    branch: String(menu.branch?.id || ""),
    table: String(menu.table?.table_code || ""),
    locale: selectedLocale,
  });

  return (
    <div className="mx-auto min-h-screen max-w-5xl bg-slate-50 px-4 pb-32 sm:px-6" lang={selectedLocale}>
      {!online || offlineCached ? <OfflineBanner cached={offlineCached} locale={selectedLocale} /> : null}
      {offlineCached && cacheAge ? (
        <p className="mx-auto mt-2 max-w-3xl px-4 text-xs font-semibold text-amber-800">
          Showing saved menu from {Math.max(1, Math.round(cacheAge / 60000))} minute{Math.round(cacheAge / 60000) === 1 ? "" : "s"} ago.
        </p>
      ) : null}
      <PublicShopHeader menu={menu} locale={selectedLocale} query={query} onQuery={setQuery} onClearQuery={() => setQuery("")} onLocale={changeLocale} />

      <CategoryTabs categories={menu.categories} active={active} counts={categoryCounts} onSelect={scrollToCategory} />

      {featuredProducts.length ? (
        <section className="mt-5">
          <SectionTitle eyebrow={t(selectedLocale, "featured")} title={t(selectedLocale, "popularNow")} />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {featuredProducts.map((product) => <PublicProductCard key={`featured-${product.id}`} product={product} locale={selectedLocale} onAdd={setSelected} onView={setSelected} />)}
          </div>
        </section>
      ) : null}

      <div className="mt-6 grid gap-8">
        {visibleCategories.map((category) => (
          <section key={category.id} id={`category-${category.id}`} className="scroll-mt-32">
            <SectionTitle eyebrow={t(selectedLocale, "menu")} title={category.name} />
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {category.products.map((product) => <PublicProductCard key={product.id} product={product} locale={selectedLocale} onAdd={setSelected} onView={setSelected} />)}
            </div>
          </section>
        ))}
        {!visibleCategories.length ? (
          <PublicEmptyState title={t(selectedLocale, "noProductsFound")} description={t(selectedLocale, "tryAnotherSearch")} actionLabel={t(selectedLocale, "clearSearch")} onAction={() => setQuery("")} />
        ) : null}
      </div>
      <ProductDetailSheet
        open={Boolean(selected)}
        product={selected}
        locale={selectedLocale}
        onClose={() => setSelected(null)}
        onAdd={addConfiguredItem}
        onValidationError={(message) => toastError(message)}
      />
      <StickyCartBar
        cart={cart}
        locale={selectedLocale}
        label={t(selectedLocale, "checkout")}
        helper={t(selectedLocale, "reviewCartBeforeCheckout")}
        onClick={() => navigate(`/cart?${checkoutParams.toString()}`)}
      />
    </div>
  );
}
