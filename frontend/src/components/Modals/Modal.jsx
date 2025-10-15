import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

// Reusable Modal (React + Tailwind)
// Fixed version without TypeScript
// - onClose is optional and guarded to prevent runtime errors.
// - Handles ESC, backdrop click, and focus trap.
// - Uses Tailwind for styling.

const SIZES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  showClose = true,
  className = "",
}) => {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  const handleClose = useCallback(() => {
    if (typeof onClose === "function") {
      try {
        onClose();
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Modal: onClose threw an error:", err);
        }
      }
    } else {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Modal: onClose is not a function or not provided. Modal will not close automatically.");
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
      return;
    }

    previouslyFocused.current = document.activeElement;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => dialogRef.current?.focus(), 50);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        handleClose();
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, handleClose]);

  if (typeof window === "undefined" || typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-40 flex items-center justify-center pointer-events-none ${
        isOpen ? "" : "invisible"
      }`}
    >
      <div
        ref={overlayRef}
        onMouseDown={(e) => {
          if (!closeOnBackdrop) return;
          if (e.target === overlayRef.current) handleClose();
        }}
        className={`absolute inset-0 transition-opacity duration-300 pointer-events-auto ${
          isOpen ? "opacity-60" : "opacity-0"
        } bg-black/60 backdrop-blur-sm`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
        ref={dialogRef}
        tabIndex={-1}
        className={`pointer-events-auto transform transition-all duration-300 ease-out w-full px-4 ${SIZES[size]} ${
          isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-6 opacity-0 scale-95"
        } ${className}`}
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
            </div>

            {showClose && (
              <button
                onClick={handleClose}
                aria-label="Close dialog"
                className="ml-4 inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>

          <div className="p-6 text-slate-700 dark:text-slate-300">{children}</div>

          {footer ? (
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
