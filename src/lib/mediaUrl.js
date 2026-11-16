/**
 * Resolve CMS image paths for display in the admin UI.
 * - Absolute http(s) / protocol-relative / data: → unchanged
 * - Root-relative (/insights/…) → prefix public site origin
 */
export function resolveMediaUrl(src, siteOrigin) {
  if (!src || typeof src !== "string") return "";
  const value = src.trim();
  if (!value) return "";
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("//") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }
  if (value.startsWith("/")) {
    const origin = String(siteOrigin || "").replace(/\/$/, "");
    return origin ? `${origin}${value}` : value;
  }
  return value;
}

export function publicSiteOrigin() {
  if (typeof window !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ||
      ""
    );
  }
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.PUBLIC_SITE_URL ||
    ""
  );
}
