import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";
import { getAppSettings } from "./admin/actions";
import { createRootMetadata, getSiteStructuredData, siteViewport } from "@/lib/seo";

const montserrat = localFont({
  src: "./fonts/montserrat-latin.woff2",
  variable: "--font-montserrat",
  weight: "300 900",
  display: "swap",
});

const cinzel = localFont({
  src: "./fonts/cinzel-latin.woff2",
  variable: "--font-cinzel",
  weight: "400 900",
  display: "swap",
});

export const metadata: Metadata = createRootMetadata();
export const viewport = siteViewport;

import { Toaster } from "sonner";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: settings } = await getAppSettings();
  const logoUrl = settings?.logo_url || null;

  return (
    <html lang="en" className={cn("dark scroll-smooth", montserrat.variable, cinzel.variable)}>
      <body className="antialiased min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getSiteStructuredData()).replace(/</g, "\\u003c") }} />
        <Toaster position="top-center" richColors />
        <Navbar logoUrl={logoUrl} />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
