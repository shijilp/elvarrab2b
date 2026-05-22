"use client";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

interface ConfirmModalProps {
  show: boolean;
  title?: string;
  message: string;

  confirmText?: string;
  cancelText?: string;

  onConfirm: () => void | Promise<void>;
  onCancel: () => void;

  type?: "info" | "warning" | "error" | "success";
  loading?: boolean; // optional: disable buttons + show "Processing..."
}

export default function ConfirmModal({
  show,
  title = "Confirm",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "warning",
  loading = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => setMounted(true), []);

  // Scroll lock (same logic you used)
  useEffect(() => {
    if (!show) return;

    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;

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

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    if (scrollbarWidth)
      document.body.style.paddingRight = `${scrollbarWidth}px`;

    const prevent = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", prevent, { passive: false });

    return () => {
      document.body.style.overflow = prev.overflow;
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.width = prev.width;
      document.body.style.paddingRight = prev.paddingRight;

      const y = Math.abs(parseInt(prev.top || "0", 10)) || scrollY;
      window.scrollTo(0, y);

      document.removeEventListener("touchmove", prevent);
    };
  }, [show]);

  // Escape to close
  useEffect(() => {
    if (!show) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [show, onCancel]);

  const colors =
    {
      info: "border-blue-500",
      warning: "border-yellow-500",
      error: "border-red-500",
      success: "border-green-500",
    }[type] || "border-yellow-500";

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
          onClick={onCancel}
          aria-hidden="true"
        >
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={`w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-xl border-t-4 ${colors}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <h2 className="text-lg font-semibold mb-3">{title}</h2>

            <p className="text-neutral-700 dark:text-neutral-300 mb-5 leading-relaxed">
              {message}
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={onCancel}
                disabled={loading}
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition disabled:opacity-60"
              >
                {cancelText}
              </button>

              <button
                onClick={onConfirm}
                disabled={loading}
                className="rounded-lg bg-black text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-60"
              >
                {loading ? "Processing..." : confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
