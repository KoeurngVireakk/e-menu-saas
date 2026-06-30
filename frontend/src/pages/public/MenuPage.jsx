import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Star } from "lucide-react";
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
  const [reviewsInfo, setReviewsInfo] = useState(null);

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
        setReviewsInfo(null);
        setError("");

        api
          .get(`/public/shops/${shopSlug}/reviews`, withAbortSignal({ params: { per_page: 3 } }, controller.signal))
          .then((reviewsResponse) => setReviewsInfo(reviewsResponse.data.data))
          .catch((reviewsError) => {
            if (!isRequestCanceled(reviewsError)) {
              setReviewsInfo(null);
            }
          });
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
          setReviewsInfo(null);
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
    toastSuccess(`${cartItem.name} ${t(selectedLocale, "addedToCart")}. ${t(selectedLocale, "addedToCartMessage")}`);
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
        <p className="khmer-text mx-auto mt-2 max-w-3xl px-4 text-xs font-semibold leading-5 text-amber-800">
          {t(selectedLocale, "savedMenuAge").replace("{{minutes}}", Math.max(1, Math.round(cacheAge / 60000)))}
        </p>
      ) : null}
      <PublicShopHeader menu={menu} locale={selectedLocale} query={query} onQuery={setQuery} onClearQuery={() => setQuery("")} onLocale={changeLocale} />

      <PublicReviewPreview reviewsInfo={reviewsInfo} locale={selectedLocale} />

      <CategoryTabs categories={menu.categories} active={active} counts={categoryCounts} locale={selectedLocale} onSelect={scrollToCategory} />

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

function PublicReviewPreview({ reviewsInfo, locale }) {
  const reviews = reviewsInfo?.reviews || [];
  const summary = reviewsInfo?.summary || {};
  const count = Number(summary.count || 0);
  const average = Number(summary.average_rating || 0);

  if (!count || !reviews.length) {
    return null;
  }

  return (
    <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm shadow-slate-900/5" aria-label={t(locale, "publicReviewsTitle")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="khmer-label text-xs font-black text-slate-500">{t(locale, "publicReviewsEyebrow")}</p>
          <h2 className="khmer-heading mt-1 text-lg font-black text-slate-950">{t(locale, "publicReviewsTitle")}</h2>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-3 py-2 text-amber-700">
          <Star className="h-5 w-5 fill-amber-400" aria-hidden="true" />
          <span className="text-sm font-black">{average.toFixed(1)}</span>
          <span className="text-xs font-bold text-amber-700/80">{t(locale, "publicReviewsCount").replace("{{count}}", count)}</span>
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {reviews.slice(0, 3).map((review) => (
          <article key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex gap-0.5" aria-label={`${t(locale, "rating")}: ${review.rating}`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`h-4 w-4 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} aria-hidden="true" />
              ))}
            </div>
            {review.comment ? <p className="khmer-text mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">{review.comment}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
