const MENU_CACHE_PREFIX = "emenu_public_menu_cache";

export function menuCacheKey(shopSlug, search) {
  return `${MENU_CACHE_PREFIX}:${shopSlug}:${search || ""}`;
}

export function readMenuCache(key) {
  try {
    const cached = JSON.parse(localStorage.getItem(key) || "null");
    return cached?.data ? cached : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function writeMenuCache(key, data) {
  localStorage.setItem(key, JSON.stringify({
    data,
    cachedAt: new Date().toISOString(),
  }));
}
