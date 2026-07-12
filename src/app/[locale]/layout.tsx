import "./globals.css";
import React from "react";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import GoogleAnalyticsInit from "@/lib/ga";
import { fontVariables } from "@/lib/fonts";
import NextTopLoader from "nextjs-toploader";
import { ActiveThemeProvider } from "@/components/active-theme";
import { Toaster } from "@/components/ui/sonner";
import { getLocale, getMessages } from "next-intl/server";
import IntlClientProvider from "@/i18n/intl-client-provider";
import ReactQueryProvider from "@/utils/providers/react-query-provider";

export const metadata = {
  title: 'Tawer MGT',
  description: 'A platform to manage teams efficiently', // Meta description for SEO
  icons: {
    icon: '/logo.png', // path to your icon
  },
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn("bg-background group/layout font-sans", fontVariables)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <IntlClientProvider locale={locale} messages={messages}>
            <ReactQueryProvider>
              <ActiveThemeProvider>
                {children}
                <Toaster position="top-center" richColors />
                <NextTopLoader
                  color="var(--primary)"
                  showSpinner={false}
                  height={2}
                  shadow-sm="none"
                />
                {process.env.NODE_ENV === "production" ? <GoogleAnalyticsInit /> : null}
              </ActiveThemeProvider>
            </ReactQueryProvider>
          </IntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
