import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const SIZES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const Modal = ({ isOpen, onClose, title, children, footer, size = "md", className = "" }) => {
  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* پس‌زمینه */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* مدال */}
          <motion.div
            className={`relative w-full mx-4 ${SIZES[size]} transform `}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()} // جلوگیری از بستن با کلیک روی داخل
          >
            <div className={`${className} bg-zinc-900  rounded-2xl shadow-2xl overflow-hidden`}>
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Body */}
              <div className="p-6 text-slate-700 dark:text-slate-300">{children}</div>

              {/* Footer */}
              {footer && (
                <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;