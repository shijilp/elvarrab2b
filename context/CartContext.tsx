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
import { api, validateCoupon } from "@/lib/api";
import { getVisitorId } from "@/lib/visitors";
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
  addToCart: (
    product: CartProduct,
    variant_id: number | null,
    quantity?: number,
  ) => void;
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

  const normalizeVariantId = (variantId: any): number | null => {
    if (variantId === null || variantId === undefined || variantId === "") {
      return null;
    }

    const n = Number(variantId);
    return Number.isNaN(n) ? null : n;
  };

  const getCartProductId = (item: any): number => {
    if (typeof item.product === "object" && item.product !== null) {
      return Number(item.product.id);
    }

    return Number(item.product ?? item.productId ?? item.id);
  };

  const getCartVariantId = (item: any): number | null => {
    if (item.variant_id !== undefined && item.variant_id !== null) {
      return normalizeVariantId(item.variant_id);
    }

    if (typeof item.variant === "object" && item.variant !== null) {
      return normalizeVariantId(item.variant.id);
    }

    return normalizeVariantId(item.variant);
  };

  const isSameCartLine = (
    item: any,
    productId: number,
    variantId: number | null,
  ) => {
    return (
      getCartProductId(item) === Number(productId) &&
      getCartVariantId(item) === normalizeVariantId(variantId)
    );
  };

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
          //const items = (res.data || []).map((item: any) => {
          //const p = typeof item.product === "object" ? item.product : null;
          //const productId = p?.id ?? item.product;
          //const itemprice = item.price || 0;

          const items = (res.data || []).map((item: any) => {
            const p = typeof item.product === "object" ? item.product : null;
            const productId = p?.id ?? item.product_id ?? item.product;
            const variantId =
              item.variant_id ??
              (typeof item.variant === "object" && item.variant !== null
                ? item.variant.id
                : item.variant) ??
              null;
            const itemprice = Number(item.price || 0);

            return {
              id: productId,
              name: p?.name || item.name || "",
              price: itemprice,
              quantity: Number(item.quantity || 1),
              image: p?.image_url || p?.image || item.image || "",
              product: p ?? productId,
              slug: p?.slug || item.slug || "",
              description: p?.description || item.description || "",
              category: p?.category || item.category || "",
              discount: 0,
              variant: item.variant || null,
              variant_id: normalizeVariantId(variantId),
              coupon_discount: 0,
              stock: item.stock ?? p?.stock ?? 0,
              is_free_shipping: p?.is_free_shipping ?? false,
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
          setCartItems(items);
        }
      } catch {}
    };

    load();
  }, [user]);

  // Add or update quantity
  const addToCart = async (
    product: CartProduct,
    variant_id: number | null,
    quantity = 1,
  ) => {
    const normalizedVariantId = normalizeVariantId(variant_id);
    const requestedQty = Math.max(1, Number(quantity || 1));

    const exists = cartItems.find((item) =>
      isSameCartLine(item, product.id, normalizedVariantId),
    );

    const variant =
      product.variants?.find((v) => v.id === normalizedVariantId) ?? null;

    const priceTier = [...(product.wholesale_price || [])]
      .sort((a, b) => b.min_qty - a.min_qty)
      .find((tier) => requestedQty >= tier.min_qty);
    const price = Number(
      priceTier?.unit_price ?? product.wholesale_price?.[0]?.unit_price ?? 0,
    );

    const baseItem: CartItem = {
      id: product.id,
      name: product.name,
      price,
      quantity: requestedQty,
      image: product.image,
      product,
      slug: product.slug,
      description: product.description,
      is_free_shipping: product.is_free_shipping,
      category: product.category,
      discount: 0,
      variant_id: normalizedVariantId,
      coupon_discount: 0,
      stock: variant ? (variant.inventory ?? 0) : (product.stock ?? 0),
    };

    const newItems = (exists
      ? cartItems.map((item) =>
          isSameCartLine(item, product.id, normalizedVariantId)
            ? {
                ...item,
                quantity: Number(item.quantity || 0) + requestedQty,
                price,
              }
            : item,
        )
      : [...cartItems, baseItem]
    ).map((item) => ({ ...item, coupon_discount: 0 }));

    setCoupon(null);
    setCartItems(newItems);
    persistGuestCart(newItems);

    if (user) {
      try {
        if (exists) {
          await api.patch(`b2b/cart/${product.id}/update/`, {
            quantity: Number(exists.quantity || 0) + requestedQty,
            variant_id: normalizedVariantId,
          });
        } else {
          await api.post("b2b/cart/", {
            product_id: product.id,
            quantity: requestedQty,
            variant_id: normalizedVariantId,
            price,
          });
        }
      } catch (err) {
        console.error("Backend cart sync failed:", err);
      }
    }
  };
  const updateQuantity = async (
    productId: number,
    quantity: number,
    variant_id: number | null,
  ) => {
    const normalizedVariantId = normalizeVariantId(variant_id);
    const safeQty = Math.max(1, Number(quantity || 1));

    const updated = cartItems.map((item) =>
      isSameCartLine(item, productId, normalizedVariantId)
        ? { ...item, quantity: safeQty, coupon_discount: 0 }
        : { ...item, coupon_discount: 0 },
    );

    setCoupon(null);
    setCartItems(updated);
    persistGuestCart(updated);

    if (user) {
      try {
        await api.patch(`b2b/cart/${productId}/update/`, {
          quantity: safeQty,
          variant_id: normalizedVariantId,
        });
      } catch (err) {
        console.error("Failed to update quantity", err);
      }
    }
  };

  // Remove or decrement
  const removeFromCart = async (
    productId: number,
    variant_id: number | null,
  ) => {
    const normalizedVariantId = normalizeVariantId(variant_id);

    const item = cartItems.find((i) =>
      isSameCartLine(i, productId, normalizedVariantId),
    );

    if (!item) {
      console.warn("Cart item not found for remove:", {
        productId,
        variant_id: normalizedVariantId,
        cartItems,
      });
      return;
    }

    const updatedCart = cartItems.filter(
      (i) => !isSameCartLine(i, productId, normalizedVariantId),
    ).map((item) => ({ ...item, coupon_discount: 0 }));

    setCoupon(null);
    setCartItems(updatedCart);
    persistGuestCart(updatedCart);

    if (user) {
      try {
        await api.delete(`/b2b/cart/${productId}/remove/`, {
          params: {
            variant_id: normalizedVariantId,
          },
        });
      } catch (err) {
        console.error("Backend remove failed:", err);
      }
    }
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
            api.delete(`b2b/cart/${getCartProductId(item)}/remove/`, {
              params: {
                variant_id: getCartVariantId(item),
              },
            }),
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
    const data = await validateCoupon(
      code,
      cartItems,
      email,
      shippingcost,
      getVisitorId(),
    );
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
          price: alloc.unit_price !== undefined
            ? Number(alloc.unit_price)
            : item.price,
          discount: Number(alloc.discount ?? item.discount ?? 0),
          coupon_discount: Number(alloc.coupon_discount ?? 0),
        };
      }),
    );
  };

  const clearCoupon = async () => {
    setCoupon(null);
    setCartItems((current) => {
      const cleared = current.map((item) => ({ ...item, coupon_discount: 0 }));
      persistGuestCart(cleared);
      return cleared;
    });
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
