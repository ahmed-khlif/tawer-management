"use client";

import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import type { ReactNode } from "react";

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

interface Props {
  locale: string;
  messages: AbstractIntlMessages;
  children: ReactNode;
}

/**
 * Client-side wrapper around `NextIntlClientProvider`.
 *
 * `getMessageFallback` and `onError` cannot be passed from a server component
 * (they are functions), so we configure them in this client boundary. The
 * fallback returns a humanised version of the last segment of a missing key,
 * e.g. `modules.projects.project.details.tabs.aiInsights` → "Ai Insights",
 * so the UI never shows the raw dotted path.
 */
export default function IntlClientProvider({ locale, messages, children }: Props) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      getMessageFallback={({ key }) => {
        const lastSegment = key.split(".").pop() ?? key;
        return humanizeKey(lastSegment);
      }}
      onError={() => {
        // Swallow noisy "missing message" warnings — the fallback above keeps
        // the UI usable.
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
