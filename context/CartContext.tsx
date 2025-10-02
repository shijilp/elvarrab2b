"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CartItem, CartProduct, Product, ProductLite } from "@/types";
import { useAuth } from "./AuthContext";
import { api, applyCoupon, removeCoupon, validateCoupon } from "@/lib/api";
type GuestItem = {
  id?: number;
  productId?: number;
  name?: string;
  price?: number;
  quantity?: number;
  image?: string;
  image_url?: string;
  slug?: string;
  description?: string;
  category?: string;
  // in_stock?: boolean;
  inventory?: number;
  low_stock_threshold?: number;
  backorder_allowed?: boolean;
  is_active?: boolean;
};

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: CartProduct) => void;
  coupon: CouponState;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  updateQuantity: (productId: number, quantity: number) => void; // ✅ Add this
  validateAndSetCoupon: (code: string, email?: string) => Promise<void>;
  clearCoupon: () => Promise<void>;
}

type CouponState = {
  code: string;
  discount: number;
  grandTotal?: number;
} | null;

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const [coupon, setCoupon] = useState<CouponState>(null);

  // Load backend cart if logged in
  useEffect(() => {
    const load = async () => {
      // Authenticated → load from backend
      if (user) {
        try {
          const res = await api.get("cart/", {
            headers: { Authorization: `Bearer ${user.access}` },
          });

          // product may be an ID (number) OR a nested object (if you later change serializer)
          const items = (res.data || []).map((item: any) => {
            const p = typeof item.product === "object" ? item.product : null;
            const productId = p?.id ?? item.product;
            return {
              id: productId,
              name: p?.name || "", // default to empty string if undefined
              price: p?.price || 0, // default to 0 if undefined
              quantity: Number(item.quantity),
              image: p?.image_url || p?.image || "", // default to empty string if undefined
              product: productId,
              slug: p?.slug || "", // add slug with default value
              description: p?.description || "", // add description with default value
              category: p?.category || "", // add category with default value
              // in_stock: p?.in_stock || false, // add in_stock with default value
            };
          });

          setCartItems(items);
          return;
        } catch (err) {
          console.error("Failed to load cart:", err);
        }
      }

      // Guest fallback (read client cart if you keep one)
      try {
        const raw = localStorage.getItem("cart");
        if (raw) {
          const arr = JSON.parse(raw);
          const items = (Array.isArray(arr) ? arr : []).map((x: any) => ({
            id: x.id ?? x.productId,
            name: x.name,
            price: x.price,
            quantity: x.quantity ?? 1,
            image: x.image ?? x.image_url,
            product: x.id ?? x.productId,
            slug: x.slug || "", // add slug with default value
            description: x.description || "", // add description with default value
            category: x.category || "", // add category with default value
            // in_stock: x.in_stock || false, // add in_stock with default value
          }));
          setCartItems(items);
        }
      } catch {}
    };

    load();
  }, [user]);

  // Add or update quantity
  const addToCart = async (product: CartProduct) => {
    const exists = cartItems.find((item) => item.id === product.id);
    const newItems = exists
      ? cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...cartItems, { ...product, quantity: 1 }];

    setCartItems(newItems);

    if (user) {
      try {
        if (exists) {
          await api.patch(
            `cart/${product.id}/`,
            { quantity: exists.quantity + 1 },
            { headers: { Authorization: `Bearer ${user.access}` } }
          );
        } else {
          await api.post(
            "/cart/",
            { product_id: product.id, quantity: 1 },
            { headers: { Authorization: `Bearer ${user.access}` } }
          );
        }
      } catch (err) {
        console.error("Backend cart sync failed:", err);
      }
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    const updated = cartItems.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );
    setCartItems(updated);

    if (user) {
      try {
        await api.patch(
          `/cart/${productId}/update/`,
          { quantity },
          {
            headers: {
              Authorization: `Bearer ${user.access}`,
            },
          }
        );
      } catch (err) {
        console.error("Failed to update quantity", err);
      }
    }
  };

  // Remove or decrement
  const removeFromCart = async (productId: number) => {
    const item = cartItems.find((i) => i.id === productId);
    if (!item) return;

    let updatedCart: CartItem[];

    if (item.quantity > 1) {
      updatedCart = cartItems.map((i) =>
        i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
      );
    } else {
      updatedCart = cartItems.filter((i) => i.id !== productId);
    }

    setCartItems(updatedCart);

    if (user) {
      try {
        if (item.quantity > 1) {
          await api.patch(
            `/cart/${productId}/update/`,
            { quantity: item.quantity - 1 },
            { headers: { Authorization: `Bearer ${user.access}` } }
          );
        } else {
          await api.delete(`/cart/${productId}/remove/`, {
            headers: { Authorization: `Bearer ${user.access}` },
          });
        }
      } catch (err) {
        console.error("Backend remove failed:", err);
      }
    }
  };

  // Clear cart
  const clearCart = async () => {
    setCartItems([]);
    if (user) {
      try {
        const res = await api.get("cart/", {
          headers: { Authorization: `Bearer ${user.access}` },
        });

        await Promise.all(
          res.data.results.map((item: any) =>
            api.delete(`cart/${item.product.id}/remove/`, {
              headers: { Authorization: `Bearer ${user.access}` },
            })
          )
        );
      } catch (err) {
        console.error("Failed to clear backend cart:", err);
      }
    }
  };

  const validateAndSetCoupon = async (code: string, email?: string) => {
    const data = await validateCoupon(code, email);
    setCoupon({
      code: data.coupon.code,
      discount: Number(data.discount),
      grandTotal: Number(data.grand_total),
    });
    await applyCoupon(code, email); // optional if you persist server-side
  };

  const clearCoupon = async () => {
    await removeCoupon();
    setCoupon(null);
  };
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        validateAndSetCoupon,
        clearCoupon,
        coupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
