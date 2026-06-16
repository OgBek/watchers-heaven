import type { Metadata } from "next";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { Footer } from "@/components/layout/Footer";
import { CinemaModeProvider } from "@/components/effects/CinemaModeProvider";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeScript } from "@/components/effects/ThemeScript";
import "../globals.css";

export const metadata: Metadata = {
  title: "Watchers Heaven",
  description: "Your personal entertainment universe.",
};

const themeScript = `
try {
  const mode = localStorage.getItem('setting-theme-mode');
  if (mode === 'dark') document.documentElement.classList.add('dark');
  const accent = localStorage.getItem('setting-accent-color');
  if (accent) document.documentElement.style.setProperty('--color-accent-blue', accent);
  const font = localStorage.getItem('setting-font-family');
  if (font === 'ethiopic') {
    document.documentElement.style.setProperty('--font-sans', '"Noto Sans Ethiopic", sans-serif');
  } else if (font === 'system') {
    document.documentElement.style.setProperty('--font-sans', 'system-ui, sans-serif');
  }
} catch (e) {}
`;

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Get messages for the locale
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Noto+Sans+Ethiopic:wght@400..700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased mesh-bg" suppressHydrationWarning>
        <ThemeScript script={themeScript} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SmoothScroll>
            <CinemaModeProvider>
              <div className="flex min-h-screen">
                <FloatingNav />
                <main className="flex-1 w-full relative px-4 lg:pl-24 lg:pr-8 flex flex-col justify-between">
                  <div className="flex-grow">
                    {children}
                  </div>
                  <Footer />
                </main>
              </div>
            </CinemaModeProvider>
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
