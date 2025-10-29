"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { api } from "@/lib/api";

/** ---------------- Types ---------------- */

export type RFQCartItem = {
  id?: number; // backend RFQItem id (when logged-in)
  product: number; // product id
  name?: string; // optional snapshot for display
  image?: string;
  slug?: string;
  requested_qty: number; // requested quantity
  remark?: string;
};

export type RFQDraft = {
  id?: number; // backend RFQ id (when logged-in)
  status?: string; // draft|submitted|...
  items: RFQCartItem[];
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  notes?: string;
};

type SubmitPayload = {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  notes?: string;
};

interface RFQCartContextType {
  rfq: RFQDraft | null;
  loading: boolean;

  // actions
  addToRFQ: (
    productId: number,
    qty?: number,
    remark?: string,
    display?: Partial<Pick<RFQCartItem, "name" | "image" | "slug">>
  ) => Promise<void>;
  updateQty: (productId: number, qty: number) => Promise<void>;
  updateRemark: (productId: number, remark: string) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearRFQ: () => Promise<void>;
  submitRFQ: (payload: SubmitPayload) => Promise<void>;
}

/** ---------------- Context ---------------- */

const RFQCartContext = createContext<RFQCartContextType | undefined>(undefined);

const LS_KEY = "rfqcart";

export const RFQCartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [rfq, setRfq] = useState<RFQDraft | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /** ---------- helpers ---------- */

  const saveLocal = (next: RFQDraft | null) => {
    if (!next) {
      localStorage.removeItem(LS_KEY);
    } else {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    }
  };

  const loadLocal = (): RFQDraft | null => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.items)) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  /** ---------- initial load ---------- */

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        if (user) {
          // Authenticated: fetch most recent DRAFT RFQ for this user
          // (API returns list, newest first)
          const { data } = await api.get("/b2b/rfq/");
          const first = Array.isArray(data) ? data[0] : null;
          if (first) {
            const mapped: RFQDraft = {
              id: first.id,
              status: first.status,
              items: (first.items || []).map((it: any) => ({
                id: it.id,
                product:
                  typeof it.product === "object" ? it.product.id : it.product,
                name:
                  typeof it.product === "object" ? it.product.name : undefined,
                image:
                  typeof it.product === "object"
                    ? it.product.image_url || it.product.image
                    : undefined,
                slug:
                  typeof it.product === "object" ? it.product.slug : undefined,
                requested_qty: Number(it.requested_qty || 1),
                remark: it.remark || "",
              })),
              customer_name: first.customer_name || "",
              customer_email: first.customer_email || "",
              customer_phone: first.customer_phone || "",
              notes: first.notes || "",
            };
            setRfq(mapped);
            saveLocal(mapped); // keep a shadow for quick UI
            return;
          }
          // none on server → try local
          const local = loadLocal();
          setRfq(local || { items: [] });
        } else {
          // Guest
          const local = loadLocal();
          setRfq(local || { items: [] });
        }
      } catch (e) {
        console.error("RFQ init failed:", e);
        const local = loadLocal();
        setRfq(local || { items: [] });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user]);

  /** ---------- actions ---------- */

  const addToRFQ: RFQCartContextType["addToRFQ"] = async (
    productId,
    qty = 10,
    remark = "",
    display
  ) => {
    // optimistic local update
    setRfq((prev) => {
      const base = prev ?? { items: [] };
      const exists = base.items.find((i) => i.product === productId);
      let items: RFQCartItem[];
      if (exists) {
        items = base.items.map((i) =>
          i.product === productId
            ? { ...i, requested_qty: i.requested_qty + qty }
            : i
        );
      } else {
        items = [
          ...base.items,
          { product: productId, requested_qty: qty, remark, ...display },
        ];
      }
      const next = { ...base, items };
      if (!user) saveLocal(next);
      return next;
    });

    // sync to backend if logged in
    if (user) {
      try {
        await api.post("/b2b/rfq/add-item/", {
          product: productId,
          requested_qty: qty,
          remark,
        });
        // reload from server to capture ids + canonical state
        const { data } = await api.get("/b2b/rfq/");
        const first = Array.isArray(data) ? data[0] : null;
        if (first) {
          const mapped: RFQDraft = {
            id: first.id,
            status: first.status,
            items: (first.items || []).map((it: any) => ({
              id: it.id,
              product:
                typeof it.product === "object" ? it.product.id : it.product,
              name:
                typeof it.product === "object" ? it.product.name : undefined,
              image:
                typeof it.product === "object"
                  ? it.product.image_url || it.product.image
                  : undefined,
              slug:
                typeof it.product === "object" ? it.product.slug : undefined,
              requested_qty: Number(it.requested_qty || 1),
              remark: it.remark || "",
            })),
            customer_name: first.customer_name || "",
            customer_email: first.customer_email || "",
            customer_phone: first.customer_phone || "",
            notes: first.notes || "",
          };
          setRfq(mapped);
          saveLocal(mapped);
        }
      } catch (e) {
        console.error("RFQ add-item sync failed:", e);
      }
    }
  };

  const updateQty: RFQCartContextType["updateQty"] = async (productId, qty) => {
    setRfq((prev) => {
      if (!prev) return prev;
      const items = prev.items.map((i) =>
        i.product === productId ? { ...i, requested_qty: qty } : i
      );
      const next = { ...prev, items };
      if (!user) saveLocal(next);
      return next;
    });

    // Optional server PATCH if you add an endpoint like:
    // PATCH /wholesale/rfq/items/:itemId/ { requested_qty }
    if (user) {
      try {
        const item = rfq?.items.find((i) => i.product === productId);
        if (item?.id) {
          await api.patch(`/b2b/rfq/items/${item.id}/`, {
            requested_qty: qty,
          });
        }
      } catch (e) {
        console.error("RFQ update qty failed:", e);
      }
    }
  };

  const updateRemark: RFQCartContextType["updateRemark"] = async (
    productId,
    remark
  ) => {
    setRfq((prev) => {
      if (!prev) return prev;
      const items = prev.items.map((i) =>
        i.product === productId ? { ...i, remark } : i
      );
      const next = { ...prev, items };
      if (!user) saveLocal(next);
      return next;
    });

    if (user) {
      try {
        const item = rfq?.items.find((i) => i.product === productId);
        if (item?.id) {
          await api.patch(`/b2b/rfq/items/${item.id}/`, { remark });
        }
      } catch (e) {
        console.error("RFQ update remark failed:", e);
      }
    }
  };

  const removeItem: RFQCartContextType["removeItem"] = async (productId) => {
    const item = rfq?.items.find((i) => i.product === productId);

    setRfq((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        items: prev.items.filter((i) => i.product !== productId),
      };
      if (!user) saveLocal(next);
      return next;
    });

    // Optional server DELETE if you add endpoint:
    // DELETE /wholesale/rfq/items/:itemId/
    if (user && item?.id) {
      try {
        await api.delete(`/b2b/rfq/items/${item.id}/`);
      } catch (e) {
        console.error("RFQ remove item failed:", e);
      }
    }
  };

  const clearRFQ: RFQCartContextType["clearRFQ"] = async () => {
    setRfq({ items: [] });
    saveLocal({ items: [] });

    // Optional: backend endpoint to clear draft RFQ
    // DELETE /wholesale/rfq/:id/ (or custom /clear/)
    if (user && rfq?.id) {
      try {
        await api.delete(`/b2b/rfq/${rfq.id}/`);
      } catch (e) {
        console.error("RFQ clear failed:", e);
      }
    }
  };

  const submitRFQ: RFQCartContextType["submitRFQ"] = async (payload) => {
    // Guest: you can still submit if backend allows anonymous submit with email
    if (!rfq) return;
    try {
      if (user && rfq.id) {
        await api.post(`/b2b/rfq/${rfq.id}/submit/`, payload);
      } else {
        // Option A (recommended): if anonymous submit is allowed on backend
        // 1) create draft RFQ on server and push items
        const createDraft = async () => {
          // add items one-by-one
          for (const it of rfq.items) {
            await api.post("/b2b/rfq/add-item/", {
              product: it.product,
              requested_qty: it.requested_qty,
              remark: it.remark || "",
            });
          }
          const { data } = await api.get("/b2b/rfq/");
          return Array.isArray(data) ? data[0]?.id : undefined;
        };

        const serverId = await createDraft();
        if (serverId) {
          await api.post(`/b2b/rfq/${serverId}/submit/`, payload);
        }
      }
      setRfq((prev) => (prev ? { ...prev, status: "submitted" } : prev));
    } catch (e) {
      console.error("RFQ submit failed:", e);
    }
  };

  const ctx: RFQCartContextType = useMemo(
    () => ({
      rfq,
      loading,
      addToRFQ,
      updateQty,
      updateRemark,
      removeItem,
      clearRFQ,
      submitRFQ,
    }),
    [rfq, loading]
  );

  return (
    <RFQCartContext.Provider value={ctx}>{children}</RFQCartContext.Provider>
  );
};

export const useRFQCart = () => {
  const ctx = useContext(RFQCartContext);
  if (!ctx) throw new Error("useRFQCart must be used inside RFQCartProvider");
  return ctx;
};
