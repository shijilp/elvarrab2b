import { api } from "./api";

export type B2BShippingConfig = {
  shipping_enabled: boolean;
  flat_rate: number;
  free_shipping_min: number;
  currency: string;
};

export const DEFAULT_B2B_SHIPPING: B2BShippingConfig = {
  shipping_enabled: true,
  flat_rate: 40,
  free_shipping_min: 3000,
  currency: "INR",
};

export async function getB2BShippingConfig(): Promise<B2BShippingConfig> {
  const { data } = await api.get("/b2b/shipping/config/");
  return {
    shipping_enabled: Boolean(data?.shipping_enabled),
    flat_rate: Number(data?.flat_rate ?? DEFAULT_B2B_SHIPPING.flat_rate),
    free_shipping_min: Number(
      data?.free_shipping_min ?? DEFAULT_B2B_SHIPPING.free_shipping_min,
    ),
    currency: String(data?.currency || "INR"),
  };
}

export async function checkB2BShipping(
  pincode: string,
  subtotal: number,
  hasFreeShippingItem = false,
) {
  const { data } = await api.get(`/b2b/shipping/check/${pincode}/`, {
    params: {
      subtotal,
      has_free_shipping_item: hasFreeShippingItem ? "1" : "0",
    },
  });
  return {
    serviceable: Boolean(data?.serviceable),
    charge: Number(data?.charge || 0),
    delivery_days:
      data?.delivery_days == null ? null : Number(data.delivery_days),
  };
}
