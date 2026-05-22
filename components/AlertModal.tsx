"use client";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

interface AlertModalProps {
  show: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  type?: "info" | "warning" | "error" | "success";
  autoCloseMs?: number;
}

export default function AlertModal({
  show,
  title = "Alert",
  message,
  onClose,
  type = "info",
  autoCloseMs,
}: AlertModalProps) {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => setMounted(true), []);

  // Robust scroll lock that preserves scroll position (prevents jump to top)
  useEffect(() => {
    if (!show) return;

    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;

    // Optional: compensate for disappearing scrollbar to avoid content shift
    const hasScrollbar =
      window.innerWidth > document.documentElement.clientWidth;
    const scrollbarWidth = hasScrollbar
      ? window.innerWidth - document.documentElement.clientWidth
      : 0;

    const prev = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      paddingRight: document.body.style.paddingRight,
    };

    document.body.style.overflow = "hidden"; // helps some browsers
    document.body.style.position = "fixed"; // freeze
    document.body.style.top = `-${scrollY}px`; // keep visual position
    document.body.style.width = "100%";
    if (scrollbarWidth)
      document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Prevent iOS background scroll via touchmove
    const prevent = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", prevent, { passive: false });

    return () => {
      // restore styles
      document.body.style.overflow = prev.overflow;
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.width = prev.width;
      document.body.style.paddingRight = prev.paddingRight;

      // restore scroll
      const y = Math.abs(parseInt(prev.top || "0", 10)) || scrollY;
      window.scrollTo(0, y);

      document.removeEventListener("touchmove", prevent);
    };
  }, [show]);

  // Optional auto-close
  useEffect(() => {
    if (!show || !autoCloseMs) return;
    const t = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(t);
  }, [show, autoCloseMs, onClose]);

  const colors =
    {
      info: "border-blue-500 text-blue-600 dark:text-blue-400",
      warning: "border-yellow-500 text-yellow-600 dark:text-yellow-400",
      error: "border-red-500 text-red-600 dark:text-red-400",
      success: "border-green-500 text-green-600 dark:text-green-400",
    }[type] || "border-blue-500 text-blue-600 dark:text-blue-400";

  const modal = (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ willChange: "opacity" }}
          onClick={onClose}
          aria-hidden="true"
        >
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={`w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-xl border-t-4 ${colors}`}
            style={{ willChange: "opacity, transform" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <h2 className="text-lg font-semibold mb-3">{title}</h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-5 leading-relaxed">
              {message}
            </p>
            <button
              onClick={onClose}
              className="rounded-lg bg-black text-white px-5 py-2 font-medium hover:bg-neutral-800 transition"
            >
              OK
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
