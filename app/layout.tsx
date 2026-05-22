import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import FloatingCheckoutButton from "@/components/ui/FloatingCheckoutbtn";
import { RFQCartProvider } from "@/context/RFQCartContext";
import { CartProvider } from "@/context/CartContext";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const brand = "Elvarra";
const defaultTitle = `${brand} – Luxury Fashion Jewelry`;
const defaultDescription =
  "Elegant, feminine jewelry for daily wear and special moments. Hand-finished pieces in gold, silver, and stones.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Elvarra — Luxury Fashion Jewelry",
    template: "%s · Elvarra",
  },
  description: defaultDescription,
  applicationName: brand,
  category: "fashion",
  alternates: {
    canonical: "/", // will be overridden on pages
  },
  openGraph: {
    type: "website",
    siteName: brand,
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    images: ["/images/about-3.jpg"], // put a default OG image in /public/og/default.jpg
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark overflow-x-clip" suppressHydrationWarning>
      <body
        className={`min-h-dvh el-bgn   overflow-x-clip    text-neutral-50 antialiased `}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <RFQCartProvider>
                <Header />
                {children}
                <FloatingCheckoutButton />
                <Footer />
              </RFQCartProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
