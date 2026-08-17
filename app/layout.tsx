import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SmoothScrollProvider from "@/components/layout/SmoothScrollProvider";
import PageLoader from "@/components/layout/PageLoader";
import StructuredData from "@/components/seo/StructuredData";
import { resolveBrandAsset } from "@/lib/brand";
import { siteUrl } from "@/lib/site";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ZAZ Digital Solutions — Logo Design, Website Design & Digital Marketing",
    template: "%s — ZAZ Digital Solutions",
  },
  description:
    "ZAZ Digital Solutions is a premium creative agency delivering logo design, custom website design, and digital marketing for US businesses.",
  openGraph: {
    title: "ZAZ Digital Solutions",
    description:
      "Premium logo design, website design, and digital marketing for US businesses.",
    siteName: "ZAZ Digital Solutions",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZAZ Digital Solutions",
    description:
      "Premium logo design, website design, and digital marketing for US businesses.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const logoSrc = resolveBrandAsset("zaz-logo");

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zaz-bg text-zaz-text">
        <StructuredData />
        {/*
          SmoothScrollProvider is listed before PageLoader so its mount
          effect (which creates the Lenis instance) commits first — React
          runs sibling effects in tree order. PageLoader's own effect locks
          scroll on mount; if it ran first, Lenis wouldn't exist yet and the
          lock's stopSmoothScroll() call would silently no-op (see
          lenisController.ts). PageLoader is still `fixed inset-0 z-[100]`,
          so this reorder has no visual/stacking effect.
        */}
        <SmoothScrollProvider>
          <Navbar logoSrc={logoSrc} />
          <main className="flex-1">{children}</main>
          <Footer logoSrc={logoSrc} />
        </SmoothScrollProvider>
        <PageLoader logoSrc={logoSrc} />
      </body>
    </html>
  );
}
