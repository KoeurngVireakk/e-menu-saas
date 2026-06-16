import {
  getPublicMenuCache,
  legacyMenuCacheKey,
  publicMenuCacheKey,
  savePublicMenuCache,
} from "../services/publicMenuCache";

export function menuCacheKey(shopSlug, search, locale = "en") {
  return publicMenuCacheKey({ shopSlug, locale, search });
}

export function readMenuCache(key) {
  return getPublicMenuCache(key) || getPublicMenuCache(key.replace("menudigi_public_menu_cache", "emenu_public_menu_cache"));
}

export function writeMenuCache(key, data) {
  savePublicMenuCache(key, data);
}

export { legacyMenuCacheKey };
