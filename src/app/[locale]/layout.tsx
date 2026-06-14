import type { Metadata } from "next";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { Footer } from "@/components/layout/Footer";
import { CinemaModeProvider } from "@/components/effects/CinemaModeProvider";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import Script from "next/script";
import "../globals.css";

export const metadata: Metadata = {
  title: "Watchers Heaven",
  description: "Your personal entertainment universe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Noto+Sans+Ethiopic:wght@400..700&display=swap" rel="stylesheet" />
        <Script id="theme-loader" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `
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
        `}} />
      </head>
      <body className="antialiased mesh-bg" suppressHydrationWarning>
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
      </body>
    </html>
  );
}
