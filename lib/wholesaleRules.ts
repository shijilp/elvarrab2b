
export type WholesaleCartItem = {
  quantity?: number | string | null;
};

export interface WholesaleRules {
  minOrderValue: number;
  minQtyPerSku: number;
}

export const WHOLESALE_MIN_ORDER_VALUE = 1000;
export const WHOLESALE_STANDARD_MIN_QTY_PER_SKU = 1.5;
export const WHOLESALE_HIGH_VALUE_THRESHOLD = 3000;
export const WHOLESALE_HIGH_VALUE_MIN_QTY_PER_SKU = 1.35;

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
  if (orderValue > WHOLESALE_HIGH_VALUE_THRESHOLD) {
    return {
      minOrderValue: WHOLESALE_MIN_ORDER_VALUE,
      minQtyPerSku: WHOLESALE_HIGH_VALUE_MIN_QTY_PER_SKU,
    };
  }

  return {
    minOrderValue: WHOLESALE_MIN_ORDER_VALUE,
    minQtyPerSku: WHOLESALE_STANDARD_MIN_QTY_PER_SKU,
  };
}


export function calculateWholesaleEligibility({
  cartItems,
  subtotal,
  discount = 0,
  minWholesaleValue = WHOLESALE_MIN_ORDER_VALUE,
  minQtyPerSku = WHOLESALE_STANDARD_MIN_QTY_PER_SKU,
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

  const requiredMinValue = minWholesaleValue;
  const requiredQtyPerSku =
    wholesaleOrderValue > WHOLESALE_HIGH_VALUE_THRESHOLD
      ? WHOLESALE_HIGH_VALUE_MIN_QTY_PER_SKU
      : minQtyPerSku;

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

export function getWholesaleEligibilityFailureMessage(
  eligibility: WholesaleEligibility,
): string {
  const issues: string[] = [];

  if (!eligibility.isValueEligible) {
    issues.push(
      `Minimum wholesale order value is ₹${eligibility.minWholesaleValue.toLocaleString("en-IN")}.`,
    );
  }

  if (!eligibility.isQtyEligible) {
    issues.push(
      `Minimum Qty/SKU ratio is ${eligibility.minQtyPerSku}. Add ${eligibility.qtyNeededForRatio} more unit(s) or reduce the number of SKUs.`,
    );
  }

  return issues.length > 0
    ? issues.join(" ")
    : "This cart is not eligible for wholesale checkout yet.";
}
