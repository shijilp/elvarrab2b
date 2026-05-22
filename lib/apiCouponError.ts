type ApiErrorPayload = {
  code?: string;
  message?: string;
  detail?: string; // fallback if some endpoints still return "detail"
};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toAlertFromApiError(err: any): {
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
} {
  const data: ApiErrorPayload | undefined = err?.response?.data;

  const code = data?.code || data?.detail; // support old "detail"
  const messageFromServer = data?.message || data?.detail;

  // If server sent a message, use it
  if (messageFromServer) {
    return { title: "Oops", message: messageFromServer, type: "error" };
  }

  // Otherwise map by code
  switch (code) {
    case "INVALID_COUPON":
      return { title: "Invalid coupon", message: "Please check the code and try again.", type: "warning" };

    case "COUPON_NOT_LIVE":
      return { title: "Coupon not active", message: "This coupon is expired or not active yet.", type: "warning" };

    case "COUPON_MAXED_OUT":
      return { title: "Coupon limit reached", message: "This coupon has already been fully used.", type: "warning" };

    case "USER_LIMIT_REACHED":
      return { title: "Already used", message: "You’ve already used this coupon the maximum allowed times.", type: "warning" };

    case "COUPON_NOT_ALLOWED_WITH_DISCOUNTS":
      return { title: "Not allowed", message: "This coupon can’t be combined with other discounts.", type: "warning" };

    default:
      // network / unknown
      if (!err?.response) {
        return { title: "Network error", message: "Please check your connection and try again.", type: "error" };
      }
      return { title: "Error", message: "Something went wrong. Please try again.", type: "error" };
  }
}
