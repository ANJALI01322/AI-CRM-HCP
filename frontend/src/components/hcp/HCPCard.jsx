import React from "react";
import {
  Hospital,
  MapPin,
  Calendar,
  MessageSquare,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import HCPAvatar from "../common/HCPAvatar";

export default function HCPCard({
  doctor,
  onViewDetails,
  onLogInteraction,
  onEdit,
  onDelete,
}) {
  const getRelationshipInfo = (doc) => {
    if (doc.priority === "High" && doc.status === "Active") {
      return { health: "Strong", score: 92, momentum: "↑ 18%", trendType: "up", nextAction: "Deliver sample pack", barColor: "bg-emerald-500" };
    }
    if (doc.priority === "High" && doc.status === "Follow-up") {
      return { health: "At Risk", score: 58, momentum: "↓ 14%", trendType: "down", nextAction: "Pricing objection review", barColor: "bg-rose-500" };
    }
    if (doc.status === "Follow-up") {
      return { health: "Watch", score: 72, momentum: "→ 0%", trendType: "neutral", nextAction: "Schedule follow-up", barColor: "bg-amber-500" };
    }
    return { health: "Healthy", score: 84, momentum: "↑ 8%", trendType: "up", nextAction: "Routine clinical touch", barColor: "bg-teal-500" };
  };

  const rel = getRelationshipInfo(doctor);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 card-shadow hover:card-shadow-hover hover:-translate-y-0.5 flex flex-col justify-between p-5 group relative text-sm transition-all duration-200">
      <div>
        {/* Card Top: Avatar, Name, Specialization & Tier */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <HCPAvatar
              src={doctor.avatar}
              name={doctor.name}
              size="md"
              showStatus
              statusColor={rel.barColor}
            />
            <div className="min-w-0">
              <h3
                onClick={() => onViewDetails(doctor)}
                className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition truncate cursor-pointer flex items-center gap-1.5"
              >
                {doctor.name}
                {doctor.tier === "Tier 1" && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-white font-bold">
                    KOL
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {doctor.qualification}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant={rel.health} size="xs" dot>
              {rel.health}
            </Badge>
            <span
              className={`font-mono text-xs font-bold ${
                rel.trendType === "up"
                  ? "text-emerald-700"
                  : rel.trendType === "down"
                  ? "text-rose-700"
                  : "text-slate-500"
              }`}
            >
              {rel.momentum}
            </span>
          </div>
        </div>

        {/* Visual Relationship Health Bar */}
        <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Relationship Health</span>
            <span className="font-mono font-bold text-slate-900 text-xs tabular-nums">{rel.score}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`${rel.barColor} h-full rounded-full transition-all duration-500`}
              style={{ width: `${rel.score}%` }}
            />
          </div>
        </div>

        {/* Badges: Specialty & Priority */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Badge variant={doctor.specialty} size="xs">
            {doctor.specialty}
          </Badge>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            {doctor.prescribingPotential || "High Vol"}
          </span>
        </div>

        {/* Info list */}
        <div className="mt-3.5 space-y-2 text-xs sm:text-[13px] text-slate-600 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2 truncate">
            <Hospital className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-semibold text-slate-800">{doctor.hospital}</span>
          </div>

          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-slate-500">{doctor.city}, {doctor.state}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500">Last Touch: <strong className="text-slate-900 font-mono">{doctor.lastVisit}</strong></span>
          </div>

          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 truncate">
            <strong className="text-teal-800 font-mono">Next:</strong> {rel.nextAction}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(doctor)}
          className="flex-1 font-semibold"
        >
          360° Workspace
        </Button>

        <Button
          variant="primary"
          size="sm"
          icon={MessageSquare}
          onClick={() => onLogInteraction(doctor)}
          className="font-bold cursor-pointer"
        >
          Log
        </Button>
      </div>
    </div>
  );
}