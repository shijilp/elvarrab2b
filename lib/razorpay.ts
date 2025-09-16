// lib/razorpay.ts
/* export async function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if ((window as any).Razorpay) return true;

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
 */

export async function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // No 'any', no global.d.ts needed
  if ("Razorpay" in window) return true;

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve("Razorpay" in window);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}