import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

// ✅ All client calls go through your Next API proxy
// e.g. GET /api/proxy/api/products/  (-> Next server -> Django /api/products/)
export const api_backend = axios.create({
  baseURL: "/api/proxy/backend", // do NOT expose backend URL
  // withCredentials: true, // not needed for same-origin; add if you ever call cross-site
});

// ❌ No more localStorage tokens; server reads httpOnly cookie and adds Authorization.
// So request interceptor is basically a no-op (but you can keep one for tweaks).
api_backend.interceptors.request.use((config) => config);

// 401 de-duplication queue
let isRefreshing = false;
let queue: Array<() => void> = [];

type RetriableConfig =
  (InternalAxiosRequestConfig | AxiosRequestConfig) & { _retry?: boolean };

api_backend.interceptors.response.use(
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
    if (typeof original.url === "string" && original.url.includes("/api/refresh")) {
      return Promise.reject(err);
    }

    original._retry = true;

    // If a refresh is already in-flight, enqueue retry after it finishes
    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push(() => resolve(api_backend.request(original)));
      });
    }

    isRefreshing = true;
    try {
      // 🔄 Ask Next server to refresh access cookie using refresh cookie
      await axios.post("/api/refresh"); // same origin; cookies included automatically

      // ✅ After refresh succeeds, retry original request (no Authorization header needed)
      queue.forEach((cb) => cb());
      queue = [];
      return api_backend.request(original);
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



