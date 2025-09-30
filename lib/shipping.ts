import { api } from "./api";

// frontend/lib/shipping.ts
export async function bulkCreateDelhivery(orderIds: number[]) {
  const r = await api.post(
    `shipping/delhivery/bulk-create/`,
    {
     
       order_ids: orderIds 
      
    }
  );
  //if (!r.ok) throw new Error(await r.text());
  return r.data as Promise<{
    created: number;
    failed: number;
    results: { order_id: number; waybill?: string; status: "ok" | "error"; error?: string }[];
  }>;
}

export function labelUrl(waybill: string) {
  return `${process.env.NEXT_PUBLIC_API}/shipping/delhivery/label/${encodeURIComponent(waybill)}/`;
}


