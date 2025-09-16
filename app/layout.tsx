import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import FloatingCheckoutButton from "@/components/ui/FloatingCheckoutbtn";

export const metadata: Metadata = {
  title: "Elvarra — Fashion Jewelry",
  description: "Where elegance meets light.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark overflow-x-clip" suppressHydrationWarning>
      <body
        className={`min-h-dvh bg-neutral-50 text-neutral-900 dark:bg-neutral-950 overflow-x-clip     dark:text-neutral-50 antialiased `}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Header />
              {children}
              <FloatingCheckoutButton />
              <Footer />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
