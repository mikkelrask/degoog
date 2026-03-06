import { state } from "./state.js";

export const buildSearchUrl = (query, engines, type, page) => {
  const params = new URLSearchParams({ q: query });
  for (const [key, val] of Object.entries(engines)) {
    params.set(key, String(val));
  }
  if (type && type !== "all") {
    params.set("type", type);
  }
  if (page != null && page > 1) {
    params.set("page", String(page));
  }
  if (state.currentTimeFilter && state.currentTimeFilter !== "any") {
    params.set("time", state.currentTimeFilter);
  }
  return `/api/search?${params.toString()}`;
};

export const proxyImageUrl = (url) => {
  if (!url) return "";
  return `/api/proxy/image?url=${encodeURIComponent(url)}`;
};

export const faviconUrl = (url) => {
  try {
    const hostname = new URL(url).hostname;
    return proxyImageUrl(`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`);
  } catch {
    return "";
  }
};
