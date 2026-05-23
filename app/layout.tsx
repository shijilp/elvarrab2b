import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import FloatingCheckoutButton from "@/components/ui/FloatingCheckoutbtn";
import { RFQCartProvider } from "@/context/RFQCartContext";
import { CartProvider } from "@/context/CartContext";
import FloatingCheckoutButtonOne from "@/components/ui/FloatingCheckoutbtn_one";
const siteUrl = "https://b2b.elvarra.in";
const brand = "Elvarra";
const defaultTitle =
  "Elvarra Wholesale India | Anti Tarnish Jewellery Supplier";

const defaultDescription =
  "Elvarra Wholesale India offers anti tarnish jewellery for retailers, resellers and boutique stores. Shop wholesale fashion jewellery, stainless steel jewellery, gold plated jewellery and bulk jewellery supplies in India.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: defaultTitle,
    template: "%s · Elvarra Wholesale",
  },

  description: defaultDescription,

  keywords: [
    "anti tarnish jewellery wholesale",
    "anti tarnish jewellery India",
    "wholesale jewellery India",
    "fashion jewellery wholesale India",
    "stainless steel jewellery wholesale",
    "gold plated jewellery wholesale",
    "Elvarra wholesale",
    "B2B jewellery supplier India",
    "jewellery reseller India",
    "bulk jewellery supplier India",
    "anti tarnish rings wholesale",
    "anti tarnish earrings wholesale",
    "anti tarnish necklaces wholesale",
    "wholesale accessories India",
  ],

  applicationName: brand,
  category: "fashion jewellery wholesale",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    siteName: "Elvarra Wholesale",
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    images: [
      {
        url: "/images/hero2.jpg",
        width: 1200,
        height: 630,
        alt: "Elvarra Wholesale Anti Tarnish Jewellery India",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/images/hero2.jpg"],
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
                <FloatingCheckoutButtonOne />
                <Footer />
              </RFQCartProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
