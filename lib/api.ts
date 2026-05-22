import { CartItem, User } from "@/types";
import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { api_backend } from "./api_backend";

// ✅ All client calls go through your Next API proxy
// e.g. GET /api/proxy/api/products/  (-> Next server -> Django /api/products/)
export const api = axios.create({
  baseURL: "/api/proxy", // do NOT expose backend URL
  // withCredentials: true, // not needed for same-origin; add if you ever call cross-site
});

// ❌ No more localStorage tokens; server reads httpOnly cookie and adds Authorization.
// So request interceptor is basically a no-op (but you can keep one for tweaks).
api.interceptors.request.use((config) => config);

// 401 de-duplication queue
let isRefreshing = false;
let queue: Array<() => void> = [];

type RetriableConfig =
  (InternalAxiosRequestConfig | AxiosRequestConfig) & { _retry?: boolean };

api.interceptors.response.use(
  (r) => r,
  async (err: AxiosError) => {
    const res = err.response;
    const original = err.config as RetriableConfig | undefined;
    if (!res || !original) return Promise.reject(err);

    // Only handle 401s once
    if (res.status !== 401 || original._retry) {
      return Promise.reject(err);
    }
    // Don’t try to refresh while hitting the refresh endpoint itself
    if (typeof original.url === "string" && original.url.includes("/api/token/refresh")) {
      return Promise.reject(err);
    }

    original._retry = true;

    // If a refresh is already in-flight, enqueue retry after it finishes
    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push(() => resolve(api.request(original)));
      });
    }

    isRefreshing = true;
    try {
      // 🔄 Ask Next server to refresh access cookie using refresh cookie
      await axios.post("/api/token/refresh"); // same origin; cookies included automatically

      // ✅ After refresh succeeds, retry original request (no Authorization header needed)
      queue.forEach((cb) => cb());
      queue = [];
      return api.request(original);
    } catch (e) {
      // Refresh failed → optional: call logout endpoint to clear cookies, or just reject
      // await axios.post("/api/logout").catch(() => {});
      queue = [];
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);
type CouponAllocation = {
  cart_index: number;
  product_id: number;
  variant_id: number | null;
  line_total: string;
  coupon_discount: string;
  discount?: string;
};
export async function validateCoupon(code: string, cart_items:CartItem[], email?: string,shippingcost?:number,visitor_id?:string) {
  const res = await api.post("/coupons/validate/", { code, email,shippingcost,cart_items,visitor_id });
  return res.data as {
    coupon: { code: string; discount_type: string; value: string };
    subtotal: string;
    eligible_total: string;
    discount: string;
    coupon_discount:string;
    shipping_discount:string;
    grand_total: string;
    allocations?: CouponAllocation[]; // ✅ add this
  };
}


export async function applyCoupon(code: string, email?: string) {
  const res = await api.post("/cart/apply-coupon/", { code, email });
  return res.data;
}

export async function removeCoupon() {
  const res = await api.delete("/cart/coupon/");
  return res.data;
}
export async function apiMe(): Promise<User> {
  const r = await api_backend.get("/auth/me/", { withCredentials: true });
  return r.data as User;
}