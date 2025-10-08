// WhatsApp share (works on mobile & desktop)
export const WhatsAppShareButton: React.FC<{
  url: string;
  message?: string;
  className?: string;
}> = ({
  url,
  message = "Hey! Check out Elvarra jewelry. Use my link:",
  className = "",
}) => {
  const fullText = `${message} ${url}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(fullText)}`;

  async function nativeShare() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (navigator as any).share({ text: fullText, url }); // mobile PWA/native share
        return;
      }
      window.open(waHref, "_blank", "noopener,noreferrer");
    } catch {
      window.open(waHref, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      onClick={nativeShare}
      className={`rounded-xl border border-emerald-700/40 bg-emerald-600/20 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-600/30 ${className}`}
      aria-label="Share to WhatsApp"
      title="Share to WhatsApp"
    >
      {/* tiny WhatsApp glyph (inline SVG, no deps) */}
      <span className="inline-flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 32 32" className="opacity-90">
          <path
            fill="currentColor"
            d="M19.1 17.5c-.3-.2-1.8-.9-2-.9s-.5-.1-.7.2c-.2.3-.8.9-1 .9s-.5 0-.8-.3s-1.5-.6-2.9-2s-2-2.7-2.1-3s0-.5.2-.7s.3-.5.5-.8c.2-.3.1-.6 0-.8s-.7-1.7-1-2.4c-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.7.1-1 .5S4 7.6 4 8.9S4.9 11.3 5 11.6c.2.3 1.8 3.5 4.5 5.3c2.7 1.8 3.2 1.9 3.7 2.1c.5.2 1.2.2 1.6.1c.5-.1 1.8-.7 2-1.3c.2-.6.2-1.1.1-1.3zM16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.1 1.7 5.8L4 29l8.3-1.7c1.7 1 3.6 1.6 5.7 1.6c6.6 0 12-5.4 12-12S22.6 3 16 3z"
          />
        </svg>
        WhatsApp
      </span>
    </button>
  );
};
