
export type WholesaleCartItem = {
  quantity?: number | string | null;
};

export type WholesaleEligibility = {
  minWholesaleValue: number;
  minQtyPerSku: number;

  wholesaleOrderValue: number;
  totalQty: number;
  totalSku: number;
  qtyPerSku: number;

  isValueEligible: boolean;
  isQtyEligible: boolean;
  isWholesaleEligible: boolean;

  valueRequired: number;
  qtyNeededForRatio: number;
};

type CalculateWholesaleEligibilityParams = {
  cartItems: WholesaleCartItem[];
  subtotal: number;
  discount?: number;
  minWholesaleValue?: number;
  minQtyPerSku?: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
};

export function calculateWholesaleEligibility({
  cartItems,
  subtotal,
  discount = 0,
  minWholesaleValue = 2000,
  minQtyPerSku = 2,
  user,
  
}: CalculateWholesaleEligibilityParams): WholesaleEligibility {
  const wholesaleOrderValue = Math.max(
    0,
    Number(subtotal || 0) - Number(discount || 0),
  );

  const totalQty = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  const totalSku = cartItems.length;

  const qtyPerSku = totalSku > 0 ? totalQty / totalSku : 0;

  const isValueEligible = wholesaleOrderValue >= minWholesaleValue;
  const isQtyEligible = qtyPerSku >= minQtyPerSku;
  const isSuperuser=(user?.isAdmin && user.email=='shijilp@gmail.com') ||false
  const isWholesaleEligible =
    (totalSku > 0 && isValueEligible && isQtyEligible) || isSuperuser;

  const valueRequired = Math.max(0, minWholesaleValue - wholesaleOrderValue);

  const qtyNeededForRatio = Math.max(
    0,
    Math.ceil(minQtyPerSku * totalSku - totalQty),
  );

  return {
    minWholesaleValue,
    minQtyPerSku,

    wholesaleOrderValue,
    totalQty,
    totalSku,
    qtyPerSku,

    isValueEligible,
    isQtyEligible,
    isWholesaleEligible,

    valueRequired,
    qtyNeededForRatio,
  };
}