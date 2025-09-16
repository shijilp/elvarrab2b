import axios, { AxiosError } from 'axios'

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

api.interceptors.response.use(
  (r) => r,
  async (err: AxiosError) => {
    if (err.response?.status !== 401) throw err;

    if (isRefreshing) {
      // wait for the refresh to finish
      return new Promise((resolve) => {
        queue.push((newAccess) => {
          if (err.config) {
            if (err.config.headers) {
              err.config.headers.set('Authorization', `Bearer ${newAccess}`);
            }
            resolve(api.request(err.config));
          }
        });
      });
    }

    isRefreshing = true;
    try {
      const saved = localStorage.getItem("user");
      const u = saved ? JSON.parse(saved) : null;
      if (!u?.refresh) throw err;

      const res = await axios.post(`${API_BASE}/token/refresh/`, { refresh: u.refresh });
      const access = res.data.access;
      localStorage.setItem("user", JSON.stringify({ ...u, access }));

      // flush queue
      queue.forEach((cb) => cb(access));
      queue = [];

      if (err.config) {
        if (err.config.headers) {
          err.config.headers.set('Authorization', `Bearer ${access}`);
        }
        return api.request(err.config);
      }
      throw err;
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