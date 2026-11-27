import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "max-w-2xl",
  className = "",
}) {
  useBodyScrollLock(isOpen);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCloseRef.current?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog container */}
      <div className="relative flex h-full items-center justify-center p-4 text-center sm:p-6 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          className={`pointer-events-auto flex flex-col max-h-[90vh] w-full ${maxWidth} transform overflow-hidden rounded-2xl bg-white text-left align-middle modal-shadow border border-slate-200/80 transition-all animate-fade-in ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || subtitle) && (
            <div className="shrink-0 flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
              <div>
                {title && (
                  <h3 className="text-lg font-semibold text-slate-900 leading-tight">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 min-h-0 px-6 py-5 overflow-y-auto overscroll-contain custom-scrollbar">
            {children}
          </div>

          {/* Footer (stays visible while the body scrolls) */}
          {footer && (
            <div className="shrink-0 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
