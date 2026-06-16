const MENU_CACHE_PREFIX = "menudigi_public_menu_cache";
const LEGACY_MENU_CACHE_PREFIX = "emenu_public_menu_cache";

export function publicMenuCacheKey({ shopSlug, branchId = "", tableCode = "", locale = "en", search = "" }) {
  return [
    MENU_CACHE_PREFIX,
    shopSlug || "unknown-shop",
    locale || "en",
    branchId || "default-branch",
    tableCode || "default-table",
    search || "",
  ].join(":");
}

export function savePublicMenuCache(cacheKey, data) {
  if (!cacheKey || !data) {
    return;
  }

  localStorage.setItem(cacheKey, JSON.stringify({
    data,
    cachedAt: new Date().toISOString(),
  }));
}

export function getPublicMenuCache(cacheKey) {
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
    return cached?.data ? cached : null;
  } catch {
    localStorage.removeItem(cacheKey);
    return null;
  }
}

export function clearPublicMenuCache(cacheKey) {
  localStorage.removeItem(cacheKey);
}

export function getPublicMenuCacheAge(cacheKey) {
  const cached = getPublicMenuCache(cacheKey);
  if (!cached?.cachedAt) {
    return null;
  }

  const cachedAt = new Date(cached.cachedAt).getTime();
  if (Number.isNaN(cachedAt)) {
    return null;
  }

  return Date.now() - cachedAt;
}

export function legacyMenuCacheKey(shopSlug, search, locale = "en") {
  return `${LEGACY_MENU_CACHE_PREFIX}:${shopSlug}:${locale}:${search || ""}`;
}
