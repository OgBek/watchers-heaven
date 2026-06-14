import type { Metadata } from "next";
import { Bricolage_Grotesque, Noto_Sans_Ethiopic } from "next/font/google";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { CinemaModeProvider } from "@/components/effects/CinemaModeProvider";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ 
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  variable: "--font-noto-ethiopic",
});

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
    <html lang="en" className={`${bricolage.variable} ${notoSansEthiopic.variable}`}>
      <body className="antialiased mesh-bg">
        <CinemaModeProvider>
          <FloatingNav />
          {children}
        </CinemaModeProvider>
      </body>
    </html>
  );
}
