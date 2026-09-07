import React from "react";

export default function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className = "",
}) {
  const getStyles = () => {
    switch (variant) {
      // Relationship Health (Clinical OS)
      case "Strong":
        return "bg-emerald-50 text-emerald-800 border-emerald-300/80 font-semibold";
      case "Healthy":
        return "bg-teal-50 text-teal-800 border-teal-300/80 font-medium";
      case "Watch":
        return "bg-amber-50 text-amber-900 border-amber-300/80 font-medium";
      case "At Risk":
        return "bg-rose-50 text-rose-800 border-rose-300/80 font-semibold";

      // Specialties
      case "Cardiology":
        return "bg-rose-50 text-rose-800 border-rose-200 font-medium";
      case "Neurology":
        return "bg-indigo-50 text-indigo-800 border-indigo-200 font-medium";
      case "Orthopedics":
        return "bg-amber-50 text-amber-900 border-amber-200 font-medium";
      case "Pediatrics":
        return "bg-sky-50 text-sky-800 border-sky-200 font-medium";
      case "Oncology":
        return "bg-purple-50 text-purple-900 border-purple-200 font-medium";
      case "Endocrinology":
        return "bg-emerald-50 text-emerald-800 border-emerald-200 font-medium";
      case "Gastroenterology":
        return "bg-orange-50 text-orange-900 border-orange-200 font-medium";
      case "Pulmonology":
        return "bg-teal-50 text-teal-900 border-teal-200 font-medium";

      // Sentiments
      case "Positive":
        return "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold";
      case "Neutral":
        return "bg-slate-100 text-slate-700 border-slate-200 font-medium";
      case "Negative":
      case "Skeptical":
        return "bg-rose-50 text-rose-800 border-rose-300 font-semibold";

      // Account Tiers & Priority
      case "KOL":
        return "bg-amber-100/80 text-amber-950 border-amber-300 font-bold";
      case "Tier 1":
        return "bg-slate-900 text-white border-slate-800 font-semibold";
      case "Tier 2":
        return "bg-slate-100 text-slate-700 border-slate-200 font-medium";
      case "High":
      case "Urgent":
        return "bg-rose-50 text-rose-800 border-rose-200 font-semibold";
      case "Medium":
        return "bg-amber-50 text-amber-900 border-amber-200 font-medium";
      case "Low":
        return "bg-slate-100 text-slate-600 border-slate-200 font-medium";

      // Operational Statuses
      case "Active":
      case "Completed":
        return "bg-emerald-50 text-emerald-800 border-emerald-300 font-medium";
      case "Follow-up":
      case "In Progress":
        return "bg-sky-50 text-sky-800 border-sky-200 font-medium";
      case "Pending":
      case "Upcoming":
        return "bg-slate-100 text-slate-700 border-slate-200 font-medium";
      case "Inactive":
      case "Postponed":
        return "bg-slate-100 text-slate-500 border-slate-200";

      // AI Variant
      case "ai":
        return "bg-slate-900 text-teal-300 border-slate-800 font-semibold";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200 font-medium";
    }
  };

  const getDotColor = () => {
    switch (variant) {
      case "Strong":
      case "Positive":
      case "Active":
      case "Completed":
        return "bg-emerald-500 shadow-xs";
      case "Healthy":
        return "bg-teal-500 shadow-xs";
      case "Watch":
      case "KOL":
      case "Medium":
        return "bg-amber-500 shadow-xs";
      case "At Risk":
      case "High":
      case "Urgent":
      case "Negative":
      case "Skeptical":
        return "bg-rose-500 shadow-xs";
      case "Tier 1":
      case "In Progress":
      case "Follow-up":
        return "bg-sky-500 shadow-xs";
      case "ai":
        return "bg-teal-400 shadow-xs";
      default:
        return "bg-slate-400";
    }
  };

  const sizeClasses =
    size === "xs"
      ? "text-[11px] px-2 py-0.5 leading-tight rounded-md"
      : size === "sm"
      ? "text-xs px-2.5 py-0.5 leading-tight rounded-md"
      : "text-xs sm:text-[13px] px-3 py-1 leading-tight rounded-lg";

  return (
    <span
      className={`inline-flex items-center gap-1.5 border shadow-2xs ${sizeClasses} ${getStyles()} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()} shrink-0`} />}
      {children}
    </span>
  );
}
