import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api/',
// })

// export default api

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";
export const api = axios.create({
  baseURL: API_BASE,
});

// Attach Authorization from localStorage (client-side)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        const t = u?.access || u?.token;
        if (t) config.headers.Authorization = `Bearer ${t}`;
      } catch {}
    }
  }
  return config;
});

// OPTIONAL: auto-refresh on 401 if you store refresh
let isRefreshing = false;
let queue: Array<(t: string) => void> = [];
type RetriableConfig = (InternalAxiosRequestConfig | AxiosRequestConfig) & { _retry?: boolean };

api.interceptors.response.use(
  (r) => r,
  async (err: AxiosError) => {
     const res = err.response;
     const original = err.config as RetriableConfig | undefined;
     if (!res || !original) return Promise.reject(err);
      // Only handle 401s; avoid infinite loop if we've retried already
    if (res.status !== 401 || original._retry) {
      return Promise.reject(err);
    }
      // Do not try to refresh the refresh endpoint itself
    if (typeof original.url === "string" && original.url.includes("/token/refresh")) {
      return Promise.reject(err);
    }
     original._retry = true;
    // Avoid looping on refresh endpoint itself
    if (isRefreshing) {
      // wait for the refresh to finish
      return new Promise((resolve) => {
        queue.push((newAccess:string) => {
        const headers = { ...(original.headers || {}), Authorization: `Bearer ${newAccess}` };
       resolve(api.request({ ...original, headers }));
        });
      });
    }

    isRefreshing = true;
    try {
      const saved = localStorage.getItem("user");
      const u = saved ? JSON.parse(saved) : null;
       const refresh: string | undefined = u?.refresh;
        if (!refresh) {
        throw err; // no refresh token -> fail fast
      }

      const res = await axios.post(`${API_BASE}/token/refresh/`, { refresh });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const access: string | undefined = (res.data as any)?.access;
       if (!access) throw err;
      localStorage.setItem("user", JSON.stringify({ ...u, access }));

      // flush queue
      queue.forEach((cb) => cb(access));
      queue = [];
      // Retry the original request with the new token
      const headers = { ...(original.headers || {}), Authorization: `Bearer ${access}` };
      return api.request({ ...original, headers });
   
     
    } finally {
      isRefreshing = false;
    }
  }
);

export async function validateCoupon(code: string, email?: string) {
  const res = await api.post("/coupons/validate/", { code, email });
  return res.data as {
    coupon: { code: string; discount_type: string; value: string };
    subtotal: string;
    eligible_total: string;
    discount: string;
    grand_total: string;
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