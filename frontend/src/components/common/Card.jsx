import React from "react";

export function Card({
  children,
  className = "",
  hover = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/90 subtle-shadow transition-all duration-150 ${
        hover ? "hover:border-slate-300/90 hover:card-shadow-hover cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", action }) {
  return (
    <div
      className={`px-4 sm:px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 ${className}`}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-sm sm:text-base font-semibold text-slate-900 tracking-tight leading-snug ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "" }) {
  return (
    <p className={`text-xs text-slate-500 mt-0.5 leading-normal ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return (
    <div
      className={`px-4 sm:px-5 py-3 bg-slate-50/50 border-t border-slate-100 rounded-b-xl flex items-center justify-between text-xs text-slate-500 ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;