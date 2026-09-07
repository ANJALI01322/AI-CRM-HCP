import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function PageHeader({
  title,
  subtitle,
  badge,
  breadcrumbs = [],
  actions,
  className = "",
}) {
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs sm:text-[13px] text-slate-500 mb-2.5">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={index}>
                {crumb.path && !isLast ? (
                  <Link
                    to={crumb.path}
                    className="hover:text-slate-900 transition font-medium"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-slate-900 font-semibold" : ""}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
              {title}
            </h1>
            {badge && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold font-mono bg-slate-900 text-teal-300 border border-slate-800 shadow-2xs">
                {badge}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-sm sm:text-[15px] text-slate-600 mt-1.5 leading-relaxed max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap self-start sm:self-auto pt-1 sm:pt-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}