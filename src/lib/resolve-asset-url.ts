const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  process.env.BACKEND_ADDRESS?.replace(/\/$/, "") ??
  "http://localhost:3071";

export function resolveAssetUrl(url?: string | null): string {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${BACKEND_ORIGIN}${url}`;
  }

  return url;
}

export function extractAssetPath(url?: string | null): string {
  const resolved = resolveAssetUrl(url);
  if (!resolved) return "";

  try {
    return new URL(resolved).pathname;
  } catch {
    return resolved;
  }
}
