import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendType = "up",
  subtitle,
  color = "slate",
  className = "",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-white border border-slate-200/90 card-shadow transition-all duration-200 ${
        onClick
          ? "hover:border-slate-300 hover:card-shadow-hover hover:-translate-y-0.5 cursor-pointer"
          : "hover:border-slate-300"
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            {title}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {value}
            </h3>
          </div>
        </div>

        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs">
            <Icon className="w-5 h-5 stroke-[1.75]" />
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-2">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-semibold font-mono ${
                trendType === "up"
                  ? "text-emerald-700"
                  : trendType === "down"
                  ? "text-rose-700"
                  : "text-slate-600"
              }`}
            >
              {trendType === "up" ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : trendType === "down" ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : null}
              {trend}
            </span>
          )}
          {subtitle && <span className="truncate text-slate-400 font-medium">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}