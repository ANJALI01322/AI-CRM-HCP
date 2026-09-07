import React from "react";
import { FolderSearch, Plus } from "lucide-react";
import Button from "./Button";

export default function EmptyState({
  icon: Icon = FolderSearch,
  title = "No records found",
  description = "There is no data to display matching your current query or filters.",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white/60 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-xs">
        <Icon className="w-7 h-7 stroke-[1.75]" />
      </div>

      <h4 className="text-base font-semibold text-slate-900 mb-1">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="primary" size="md" icon={Plus} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
