import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
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
import { menuCacheKey, readMenuCache, writeMenuCache } from "../../utils/menuCache";

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
  const [menu, setMenu] = useState(null);
  const [active, setActive] = useState("");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState(readCart);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [offlineCached, setOfflineCached] = useState(false);

  useEffect(() => {
    if (searchParams.get("locale") !== selectedLocale) {
      const next = new URLSearchParams(searchParams);
      next.set("locale", selectedLocale);
      setSearchParams(next, { replace: true });
    }

    setPreferredLocale(selectedLocale);
  }, [searchParams, selectedLocale, setSearchParams]);

  useEffect(() => {
    const cacheKey = menuCacheKey(shopSlug, search, selectedLocale);

    api
      .get(`/public/shops/${shopSlug}/menu?${search}`)
      .then((response) => {
        const data = response.data.data;
        setMenu(data);
        setActive(data.categories[0]?.id || "");
        writeMenuCache(cacheKey, data);
        setOfflineCached(!online);
        setError("");
      })
      .catch((requestError) => {
        const cached = readMenuCache(cacheKey);

        if (!online && cached) {
          setMenu(cached.data);
          setActive(cached.data.categories[0]?.id || "");
          setOfflineCached(true);
          setError("");
          return;
        }

        setError(!online
          ? t(selectedLocale, "offlineMissing")
          : requestError.response?.data?.message || "Menu is not available right now.");
      });
  }, [shopSlug, search, online, selectedLocale]);

  useEffect(() => {
    writeCart(cart);
  }, [cart]);

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
      {!online ? <OfflineBanner cached={offlineCached} locale={selectedLocale} /> : null}
      <PublicShopHeader menu={menu} locale={selectedLocale} query={query} onQuery={setQuery} onClearQuery={() => setQuery("")} onLocale={changeLocale} />

      <CategoryTabs categories={menu.categories} active={active} counts={categoryCounts} onSelect={scrollToCategory} />

      {featuredProducts.length ? (
        <section className="mt-5">
          <SectionTitle eyebrow={t(selectedLocale, "featured")} title={t(selectedLocale, "popularNow")} />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {featuredProducts.map((product) => <PublicProductCard key={`featured-${product.id}`} product={product} onAdd={setSelected} onView={setSelected} />)}
          </div>
        </section>
      ) : null}

      <div className="mt-6 grid gap-8">
        {visibleCategories.map((category) => (
          <section key={category.id} id={`category-${category.id}`} className="scroll-mt-32">
            <SectionTitle eyebrow={t(selectedLocale, "menu")} title={category.name} />
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {category.products.map((product) => <PublicProductCard key={product.id} product={product} onAdd={setSelected} onView={setSelected} />)}
            </div>
          </section>
        ))}
        {!visibleCategories.length ? (
          <PublicEmptyState title={t(selectedLocale, "noProductsFound")} description={t(selectedLocale, "tryAnotherSearch")} actionLabel="Clear search" onAction={() => setQuery("")} />
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
        label={t(selectedLocale, "checkout")}
        onClick={() => navigate(`/cart?${checkoutParams.toString()}`)}
      />
    </div>
  );
}
