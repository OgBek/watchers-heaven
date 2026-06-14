import type { Metadata } from "next";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { CinemaModeProvider } from "@/components/effects/CinemaModeProvider";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Noto+Sans+Ethiopic:wght@400..700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
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
              <main className="flex-1 pl-24 pr-4 md:pr-8 w-full relative">
                {children}
              </main>
            </div>
          </CinemaModeProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
