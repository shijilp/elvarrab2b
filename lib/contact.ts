const DEFAULT_RESALE_WHATSAPP_NUMBER = "919074180381";

/**
 * Public WhatsApp number used for B2B resale enquiries.
 *
 * Configure with NEXT_PUBLIC_RESALE_WHATSAPP_NUMBER, preferably in
 * international format (for example: 919074180381 or +91 90741 80381).
 */
export function getResaleWhatsAppNumber(): string {
  const configured = process.env.NEXT_PUBLIC_RESALE_WHATSAPP_NUMBER?.trim();
  const digitsOnly = configured?.replace(/\D/g, "");

  return digitsOnly || DEFAULT_RESALE_WHATSAPP_NUMBER;
}

export function getResaleWhatsAppUrl(message: string): string {
  return `https://wa.me/${getResaleWhatsAppNumber()}?text=${encodeURIComponent(message)}`;
}
