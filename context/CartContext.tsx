"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CartItem, CartProduct, Product, ProductLite, Variant } from "@/types";
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
type DiscountMeta = {
  type: "combo" | "volume" | null;
  volumePct: number;
};
type GuestDiscountsRes = {
  line_discounts: { product_id: number; line_discount: string }[];
  discount_total: string;

  discount_type: "combo" | "volume" | null;

  // ✅ Decimals usually come as string
  volume_discount_pct: string; // e.g. "10.00"
  subtotal: string; // e.g. "1050.00"
};

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: CartProduct, variant_id: number | null) => void;
  coupon: CouponState;
  removeFromCart: (productId: number, variant_id: number | null) => void;
  clearCart: () => void;
  loading: boolean;
  discountMeta: DiscountMeta;
  updateQuantity: (
    productId: number,
    quantity: number,
    variant_id: number | null,
  ) => void; // ✅ Add this
  validateAndSetCoupon: (code: string, email?: string) => Promise<void>;
  clearCoupon: () => Promise<void>;
}

type CouponState = {
  code: string;
  discount: number;
  coupon_discount: number;
  grandTotal?: number;
  shipping_discount: number | 0;
} | null;

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const [coupon, setCoupon] = useState<CouponState>(null);
  const [loading, setLoading] = useState(false);
  const [discountMeta, setDiscountMeta] = useState<DiscountMeta>({
    type: null,
    volumePct: 0,
  });

  // ✅ helper: save guest cart to localStorage
  const persistGuestCart = (items: CartItem[]) => {
    if (user) return;
    try {
      const payload = items.map((i) => ({
        id: i.id,
        productId: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        slug: i.slug,
        description: i.description,
        category: i.category,
        discount: i.discount ?? 0,
        variant_id: i.variant_id ?? null,
        coupon_discount: i.coupon_discount ?? 0,
      }));
      localStorage.setItem("wcart", JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to persist guest cart", e);
    }
  };
  // ✅ helper: ask backend for combo discounts and merge into cartItems
  const syncComboDiscounts = async (items: CartItem[]) => {
    if (!items.length) {
      setCartItems(items);
      persistGuestCart(items);
      return;
    }

    try {
      const payload = {
        items: items.map((i) => ({
          product_id: i.id,
          quantity: i.quantity,
          price: i.price,
        })),
      };

      // const res = await api_backend.post<{
      //   line_discounts: { product_id: number; line_discount: string }[];
      //   discount_total: string;
      // }>("/offers/guest-discounts/", payload);
      // const res = await api.post<GuestDiscountsRes>(
      //   "/offers/guest-discounts/",
      //   payload,
      // );
      // setDiscountMeta({
      //   type: res.data.discount_type ?? null,
      //   volumePct: Number(res.data.volume_discount_pct ?? 0),
      // });
      // const discountMap = new Map<number, number>();
      // (res.data.line_discounts || []).forEach((d) => {
      //   discountMap.set(d.product_id, Number(d.line_discount));
      // });

      // const withDiscounts = items.map((item) => ({
      //   ...item,
      //   discount: discountMap.get(item.id) ?? 0,
      // }));
      // console.log("Line ", withDiscounts);
      //  setCartItems(withDiscounts);
      //persistGuestCart(withDiscounts);
    } catch (err) {
      console.error("Failed to sync combo discounts", err);
      // fallback: still set items (no discount)
      setCartItems(items.map((i) => ({ ...i, discount: i.discount ?? 0 })));
      persistGuestCart(items);
    }
  };
  // Load backend cart if logged in
  useEffect(() => {
    const load = async () => {
      // Authenticated → load from backend
      if (user) {
        try {
          const res = await api.get("/b2b/cart/", {});

          // product may be an ID (number) OR a nested object (if you later change serializer)
          const items = (res.data || []).map((item: any) => {
            const p = typeof item.product === "object" ? item.product : null;
            const productId = p?.id ?? item.product;
            const itemprice = item.price || 0;

            return {
              id: productId,
              name: p?.name || "", // default to empty string if undefined
              price: itemprice, // default to 0 if undefined
              quantity: Number(item.quantity),
              image: p?.image_url || p?.image || "", // default to empty string if undefined
              product: productId,
              slug: p?.slug || "", // add slug with default value
              description: p?.description || "", // add description with default value
              category: p?.category || "", // add category with default value
              discount: 0,
              variant: item.variant || null,
              // in_stock: p?.in_stock || false, // add in_stock with default value
            };
          });
          // ✅ after loading, ask backend for combo discounts
          //  await syncComboDiscounts(items);
          setCartItems(items);
          return;
        } catch (err) {
          console.error("Failed to load cart:", err);
        }
      }

      // Guest fallback (read client cart if you keep one)
      try {
        const raw = localStorage.getItem("wcart");
        if (raw) {
          const arr = JSON.parse(raw);
          const items = (Array.isArray(arr) ? arr : []).map((x: any) => ({
            id: x.id ?? x.productId,
            name: x.name,
            price: x.price,
            quantity: x.quantity ?? 1,
            image: x.image ?? x.image_url,
            product: x.id ?? x.productId,
            is_free_shipping: x.is_free_shipping ?? false,
            slug: x.slug || "", // add slug with default value
            description: x.description || "", // add description with default value
            category: x.category || "", // add category with default value
            discount: x.disount || 0,
            variant_id: x.variant_id || null,
            coupon_discount: x.coupon_discount ?? 0,
            stock: x.stock || 0,
            // in_stock: x.in_stock || false, // add in_stock with default value
          }));
          //await syncComboDiscounts(items);
          //setCartItems(items);
        }
      } catch {}
    };

    load();
  }, [user]);

  // Add or update quantity
  const addToCart = async (product: CartProduct, variant_id: number | null) => {
    const exists = cartItems.find((item) => {
      if (variant_id) {
        // ⭐ variant-based match
        return (
          item.product?.id === product.id && item.variant_id === variant_id
        );
      } else {
        return (
          item.product?.id === product.id &&
          (item.variant_id === null || item.variant_id === undefined)
        );
      }

      // ⭐ non-variant product match
    });
    const variant = product.variants?.find((v) => v.id === variant_id) ?? null;
    const price = product.wholesale_price?.[0]?.unit_price ?? 0;
    // const exists = cartItems.find((item) => item.id === product.id);
    const baseItem: CartItem = {
      id: product.id,
      name: product.name,
      price: price,
      quantity: 1,
      image: product.image,
      product: product,
      slug: product.slug,
      description: product.description,
      is_free_shipping: product.is_free_shipping,
      category: product.category,
      discount: 0,
      variant_id: variant_id,
      coupon_discount: 0,
      stock: variant ? (variant.inventory ?? 0) : (product.stock ?? 0),
    };
    const newItems = exists
      ? cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      : [...cartItems, baseItem];

    // const newItems = exists
    //   ? cartItems.map((item) =>
    //       item.id === product.id
    //         ? { ...item, quantity: item.quantity + 1 }
    //         : item
    //     )
    //   : [...cartItems, { ...product, quantity: 1 }];

    setCartItems(newItems);
    persistGuestCart(newItems);
    if (user) {
      try {
        if (exists) {
          await api.patch(`b2b/cart/${product.id}/`, {
            quantity: exists.quantity + 1,
          });
        } else {
          await api.post("b2b/cart/", {
            product_id: product.id,
            quantity: 1,
            variant_id: variant_id,
            price: price,
          });
        }
      } catch (err) {
        console.error("Backend cart sync failed:", err);
      }
    }
    //  syncComboDiscounts(newItems);
  };

  const updateQuantity = async (
    productId: number,
    quantity: number,
    variant_id: number | null,
  ) => {
    const updated = cartItems.map((item) => {
      const sameProduct = item.product?.id === productId;
      const sameVariant = (item.variant_id ?? null) === (variant_id ?? null);

      return sameProduct && sameVariant ? { ...item, quantity } : item;
    });
    setCartItems(updated);
    persistGuestCart(updated);
    if (user) {
      try {
        await api.patch(`b2b/cart/${productId}/update/`, {
          quantity: quantity,
          variant_id: variant_id ?? null,
        });
      } catch (err) {
        console.error("Failed to update quantity", err);
      }
    }
    // syncComboDiscounts(updated);
  };

  // Remove or decrement
  const removeFromCart = async (
    productId: number,
    variant_id: number | null,
  ) => {
    const item = cartItems.find(
      (i) =>
        i.product?.id === productId &&
        (i.variant_id ?? null) === (variant_id ?? null),
    );
    if (!item) return;

    //let updatedCart: CartItem[];
    //const updatedCart = cartItems.filter((i) => i.id !== productId);
    const updatedCart = cartItems.filter(
      (i) =>
        !(
          i.product?.id === productId &&
          (i.variant_id ?? null) === (variant_id ?? null)
        ),
    );
    setCartItems(updatedCart);
    persistGuestCart(updatedCart);
    // syncComboDiscounts(updatedCart);
    // if (item.quantity > 0) {
    // setCartItems([]);
    // updatedCart = cartItems.map((i) =>
    //   i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
    // );
    // updatedCart = cartItems.filter((i) => i.id !== productId);
    //setCartItems(updatedCart);
    //persistGuestCart(updatedCart);
    //}
    // } else {
    //   updatedCart = cartItems.filter((i) => i.id !== productId);
    // }

    if (user) {
      try {
        if (item.quantity > 0) {
          // await api.patch(`/cart/${productId}/update/`, {
          //   quantity: item.quantity - 1,
          // });

          await api.delete(`/b2b/cart/${productId}/remove/`, {
            params: {
              variant_id: variant_id ?? null,
            },
          });
        } else {
          await api.delete(`b2b/cart/${productId}/remove/`, {
            params: { variant_id: variant_id ?? null },
          });
        }
      } catch (err) {
        console.error("Backend remove failed:", err);
      }
    }
    // syncComboDiscounts(updatedCart);
  };

  // Clear cart
  const clearCart = async () => {
    setCartItems([]);
    clearCoupon();
    persistGuestCart([]);
    localStorage.removeItem("wcart");

    if (user) {
      try {
        const res = await api.get("b2b/cart/", {});
        await Promise.all(
          res.data.map((item: any) =>
            api.delete(`b2b/cart/${item.product.id}/remove/`, {}),
          ),
        );
      } catch (err) {
        console.error("Failed to clear backend cart:", err);
      }
    }
  };
  const validateAndSetCoupon = async (
    code: string,
    email?: string,
    shippingcost?: number,
  ) => {
    const data = await validateCoupon(code, cartItems, email, shippingcost);
    setCoupon({
      code: data.coupon.code,
      discount: Number(data.discount),
      coupon_discount: Number(data.coupon_discount),
      shipping_discount: Number(data.shipping_discount),
      grandTotal: Number(data.grand_total),
    });

    const allocations = data.allocations || [];
    // ✅ update only discount and coupon_discount
    setCartItems((prev) =>
      prev.map((item, idx) => {
        const alloc = allocations.find((a: any) => a.cart_index === idx);

        if (!alloc) return item;

        return {
          ...item,
          discount: Number(alloc.discount ?? item.discount ?? 0),
          coupon_discount: Number(alloc.coupon_discount ?? 0),
        };
      }),
    );
    // await applyCoupon(code, cartItems, email, shippingcost, visitor_id);
  };

  const clearCoupon = async () => {
    setCoupon(null);
    await removeCoupon();
  };
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        loading,
        discountMeta,
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
