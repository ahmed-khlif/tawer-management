import { getRequestConfig } from "next-intl/server";

function humanizeKey(segment: string): string {
  // camelCase / kebab-case / snake_case → "Title Case"
  const spaced = segment
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
  if (!spaced) return segment;
  return spaced
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default getRequestConfig(async (params) => {
  const locale = (await params.requestLocale) || "en";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // Show a sensible fallback for missing keys instead of the raw dotted path.
    // E.g. `modules.projects.project.details.tabs.overview` → "Overview".
    getMessageFallback({ key }) {
      const lastSegment = key.split(".").pop() ?? key;
      return humanizeKey(lastSegment);
    },
    onError() {
      // Swallow noisy "missing message" warnings in the console; the fallback
      // above is sufficient to keep the UI usable.
    },
  };
});
