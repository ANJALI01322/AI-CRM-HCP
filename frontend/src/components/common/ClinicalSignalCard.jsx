import React from "react";
import {
  Sparkles,
  ArrowRight,
  Clock,
  AlertCircle,
  TrendingUp,
  FileCheck,
  Building,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import Button from "./Button";
import Badge from "./Badge";

export default function ClinicalSignalCard({
  index = "01",
  type = "opportunity", // 'opportunity' | 'risk' | 'formulary' | 'followup'
  doctor,
  signalTitle,
  why,
  aiReasoning,
  actionLabel = "Execute Action",
  confidence = 94,
  onAction,
  onViewHCP,
}) {
  const typeConfig = {
    opportunity: {
      badge: "Clinical Opportunity",
      badgeVariant: "Strong",
      borderAccent: "border-l-4 border-l-emerald-500",
      accentBg: "bg-emerald-50 text-emerald-700",
      icon: TrendingUp,
      signalColor: "text-emerald-700",
      confidenceColor: "bg-emerald-500",
    },
    risk: {
      badge: "Engagement Velocity Risk",
      badgeVariant: "At Risk",
      borderAccent: "border-l-4 border-l-rose-500",
      accentBg: "bg-rose-50 text-rose-700",
      icon: AlertCircle,
      signalColor: "text-rose-700",
      confidenceColor: "bg-rose-500",
    },
    formulary: {
      badge: "Institutional Formulary",
      badgeVariant: "Watch",
      borderAccent: "border-l-4 border-l-amber-500",
      accentBg: "bg-amber-50 text-amber-800",
      icon: FileCheck,
      signalColor: "text-amber-800",
      confidenceColor: "bg-amber-500",
    },
    followup: {
      badge: "Action Due Today",
      badgeVariant: "Healthy",
      borderAccent: "border-l-4 border-l-teal-500",
      accentBg: "bg-teal-50 text-teal-700",
      icon: Clock,
      signalColor: "text-teal-700",
      confidenceColor: "bg-teal-500",
    },
  };

  const config = typeConfig[type] || typeConfig.opportunity;
  const Icon = config.icon;

  return (
    <div
      className={`rounded-2xl bg-white border border-slate-200/90 ${config.borderAccent} card-shadow hover:card-shadow-hover hover:-translate-y-0.5 p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 text-sm relative group`}
    >
      <div className="space-y-4">
        {/* Top Header: Priority Ribbon + Type Badge + Visual Confidence Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs tracking-wider">
              PRIORITY #{index}
            </span>
            <Badge variant={config.badgeVariant} size="sm" dot>
              {config.badge}
            </Badge>
          </div>

          {/* Visual Confidence Progress Bar */}
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
            <span className="text-[11px] text-slate-400">Confidence</span>
            <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`${config.confidenceColor} h-full rounded-full transition-all duration-500`}
                style={{ width: `${confidence}%` }}
              />
            </div>
            <span className="text-slate-900 font-bold">{confidence}%</span>
          </div>
        </div>

        {/* Doctor Identity */}
        <div>
          <h4
            onClick={onViewHCP}
            className="text-base sm:text-lg font-bold text-slate-900 hover:text-teal-700 transition cursor-pointer leading-snug"
          >
            {doctor?.name || "Target Healthcare Professional"}
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 font-medium truncate mt-0.5">
            {doctor?.specialty} • {doctor?.hospital}
          </p>
        </div>

        {/* Context & Signal Evidence */}
        <div className="space-y-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono block">
              Evidence & Trigger:
            </span>
            <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium">
              {why}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 text-slate-200 space-y-1.5 border border-slate-800 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" /> AI Recommended Action:
            </span>
            <p className="text-slate-200 leading-relaxed text-xs sm:text-sm font-medium">
              {aiReasoning}
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onViewHCP}
          className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-semibold transition cursor-pointer flex items-center gap-1"
        >
          Open 360° Profile <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <Button
          variant="primary"
          size="sm"
          iconRight={ArrowRight}
          onClick={onAction}
          className="shadow-2xs font-bold cursor-pointer"
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
