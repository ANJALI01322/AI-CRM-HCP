import React from "react";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  isLoading = false,
  disabled = false,
  className = "",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer";

  const sizeStyles = {
    xs: "h-7 text-xs px-2.5 gap-1.5 font-semibold",
    sm: "h-8.5 text-xs sm:text-[13px] px-3 gap-1.5 font-semibold",
    md: "h-9.5 text-xs sm:text-sm px-4 gap-2 font-semibold",
    lg: "h-11 text-sm sm:text-base px-5 gap-2.5 font-semibold",
    icon: "h-9 w-9 p-0 rounded-lg",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-b from-slate-900 to-slate-950 text-white hover:from-slate-800 hover:to-slate-900 active:from-slate-950 active:to-black shadow-xs border border-slate-800 hover:border-slate-700",
    teal:
      "bg-gradient-to-b from-teal-600 to-teal-700 text-white hover:from-teal-500 hover:to-teal-600 active:from-teal-700 active:to-teal-800 shadow-xs border border-teal-600",
    blue:
      "bg-gradient-to-b from-sky-600 to-sky-700 text-white hover:from-sky-500 hover:to-sky-600 active:from-sky-700 active:to-sky-800 shadow-xs border border-sky-600",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200/90 active:bg-slate-300/80 border border-slate-200/90",
    outline:
      "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 active:bg-slate-100 shadow-2xs",
    ghost:
      "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 active:bg-slate-200/80",
    danger:
      "bg-gradient-to-b from-rose-600 to-rose-700 text-white hover:from-rose-500 hover:to-rose-600 active:from-rose-700 active:to-rose-800 shadow-xs border border-rose-600",
    success:
      "bg-gradient-to-b from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600 active:from-emerald-700 active:to-emerald-800 shadow-xs border border-emerald-600",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0 stroke-[2]" />
      ) : null}
      {children}
      {!isLoading && IconRight ? (
        <IconRight className="w-4 h-4 shrink-0 stroke-[2]" />
      ) : null}
    </button>
  );
}
