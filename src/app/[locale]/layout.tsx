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
      </head>
      <body className="antialiased mesh-bg" suppressHydrationWarning>
        <SmoothScroll>
          <CinemaModeProvider>
            <div className="flex min-h-screen">
              <FloatingNav />
              <main className="flex-1 pl-16 lg:pl-20 w-full relative">
                {children}
              </main>
            </div>
          </CinemaModeProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
