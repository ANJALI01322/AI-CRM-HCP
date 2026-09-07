import React from "react";
import {
  MessageSquare,
  Eye,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
} from "lucide-react";
import Badge from "../common/Badge";
import HCPAvatar from "../common/HCPAvatar";

export default function HCPTable({
  hcps,
  onViewDetails,
  onLogInteraction,
  onEdit,
  onDelete,
}) {
  // Helper for dynamic momentum and health badge
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 card-shadow overflow-hidden text-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200/90 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 select-none">
              <th className="py-4 px-5 sm:px-6">Doctor & Credentials</th>
              <th className="py-4 px-4">Specialty</th>
              <th className="py-4 px-4">Hospital & Territory</th>
              <th className="py-4 px-4">Relationship Health</th>
              <th className="py-4 px-4">Momentum</th>
              <th className="py-4 px-4">Last Touch / Next Action</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {hcps.map((doctor) => {
              const rel = getRelationshipInfo(doctor);

              return (
                <tr
                  key={doctor.id}
                  className="hover:bg-slate-50/90 transition-colors group cursor-pointer"
                  onClick={() => onViewDetails(doctor)}
                >
                  {/* Doctor Avatar & Name */}
                  <td className="py-4 px-5 sm:px-6">
                    <div className="flex items-center gap-3">
                      <HCPAvatar
                        src={doctor.avatar}
                        name={doctor.name}
                        size="md"
                        showStatus
                        statusColor={rel.barColor}
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 group-hover:text-teal-700 transition truncate flex items-center gap-2 text-sm sm:text-base">
                          {doctor.name}
                          {doctor.tier === "Tier 1" && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-white font-bold shadow-2xs">
                              KOL
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                          {doctor.qualification}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Specialty */}
                  <td className="py-4 px-4">
                    <Badge variant={doctor.specialty} size="sm">
                      {doctor.specialty}
                    </Badge>
                  </td>

                  {/* Hospital & Territory */}
                  <td className="py-4 px-4">
                    <div className="min-w-0 max-w-[220px]">
                      <p className="font-semibold text-slate-900 truncate text-sm">
                        {doctor.hospital}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                        {doctor.city}, {doctor.state}
                      </p>
                    </div>
                  </td>

                  {/* Visual Relationship Health Bar */}
                  <td className="py-4 px-4">
                    <div className="space-y-1.5 min-w-[130px]">
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant={rel.health} size="xs" dot>
                          {rel.health}
                        </Badge>
                        <span className="font-mono font-bold text-slate-900 text-xs tabular-nums">
                          {rel.score}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`${rel.barColor} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${rel.score}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Momentum Indicator */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-mono font-bold text-sm ${
                        rel.trendType === "up"
                          ? "text-emerald-700"
                          : rel.trendType === "down"
                          ? "text-rose-700"
                          : "text-slate-600"
                      }`}
                    >
                      {rel.momentum}
                    </span>
                  </td>

                  {/* Last Touch & Next Action */}
                  <td className="py-4 px-4">
                    <div className="text-slate-900 font-semibold font-mono text-xs">
                      {doctor.lastVisit || "Recent"}
                    </div>
                    <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5 max-w-[180px]">
                      <span className="text-teal-700 font-semibold font-mono">Next:</span> {rel.nextAction}
                    </div>
                  </td>

                  {/* Actions */}
                  <td
                    className="py-4 px-5 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onLogInteraction(doctor)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition cursor-pointer"
                        title="Log Detailing Interaction"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onViewDetails(doctor)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                        title="View 360° Intelligence Workspace"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(doctor)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(doctor)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Doctor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
