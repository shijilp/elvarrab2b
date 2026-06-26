
export type WholesaleCartItem = {
  quantity?: number | string | null;
};

export interface WholesaleRules {
  minOrderValue: number;
  minQtyPerSku: number;
}

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

export function getWholesaleRules(orderValue: number): WholesaleRules {
  if (orderValue > 3000) {
    return {
      minOrderValue: 1000,
      minQtyPerSku: 1.65,
    };
  }

  return {
    minOrderValue: 1000,
    minQtyPerSku: 2,
  };
}


export function calculateWholesaleEligibility({
  cartItems,
  subtotal,
  discount = 0,
  minWholesaleValue = 1000,
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

  // NEW RULE
  // Minimum order value is ₹1,000
  // If order value is above ₹3,000, Qty/SKU ratio should be 1.75
  const requiredMinValue = minWholesaleValue;
  const requiredQtyPerSku = wholesaleOrderValue > 3000 ? 1.65 : minQtyPerSku;

  const isValueEligible = wholesaleOrderValue >= requiredMinValue;
  const isQtyEligible = qtyPerSku >= requiredQtyPerSku;

  const isSuperuser =
    (user?.isAdmin && user.email === "shijilp@gmail.com") || false;

  const isWholesaleEligible =
    (totalSku > 0 && isValueEligible && isQtyEligible) || isSuperuser;

  const valueRequired = Math.max(0, requiredMinValue - wholesaleOrderValue);

  const qtyNeededForRatio = Math.max(
    0,
    Math.ceil(requiredQtyPerSku * totalSku - totalQty),
  );

  return {
    minWholesaleValue: requiredMinValue,
    minQtyPerSku: requiredQtyPerSku,

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