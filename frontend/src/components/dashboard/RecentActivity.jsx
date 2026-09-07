import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Sparkles,
  Building,
  Clock,
  ChevronRight,
  TrendingUp,
  ArrowDown,
  Activity,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Badge from "../common/Badge";

import HCPAvatar from "../common/HCPAvatar";

export default function RecentActivity({ onViewDetails }) {
  const interactions = useSelector((state) => state.interaction.items);
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredInteractions = interactions.filter((item) => {
    if (activeFilter === "positive") return item.sentiment === "Positive";
    if (activeFilter === "followup") return !!item.followUpDate;
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 card-shadow p-5 flex flex-col h-full text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
          <h3 className="font-bold text-slate-900 text-base tracking-tight flex items-center gap-2">
            WHAT CHANGED <span className="text-xs font-mono text-slate-400 font-semibold">TIMELINE</span>
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              activeFilter === "all"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("positive")}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              activeFilter === "positive"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Positive Intent
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("followup")}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              activeFilter === "followup"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Follow-ups
          </button>
        </div>
      </div>

      {/* Progressive Timeline Stream */}
      <div className="flex-1 overflow-y-auto max-h-[380px] custom-scrollbar pt-3 space-y-4">
        {filteredInteractions.length > 0 ? (
          filteredInteractions.slice(0, 4).map((item, idx) => (
            <div
              key={item.id}
              onClick={() => onViewDetails && onViewDetails(item)}
              className="relative pl-6 pb-3 last:pb-0 group cursor-pointer"
            >
              {/* Vertical connector line */}
              {idx < 3 && (
                <span className="absolute left-2.5 top-3.5 bottom-0 w-px bg-slate-200 group-hover:bg-teal-300 transition-colors" />
              )}

              {/* Timeline indicator node */}
              <span className="absolute left-1 top-2 w-4 h-4 rounded-full bg-white border-2 border-teal-500 group-hover:scale-110 transition-transform shadow-2xs flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              </span>

              {/* Event Content Block */}
              <div className="bg-slate-50/80 hover:bg-slate-100/90 p-4 rounded-xl border border-slate-200/80 transition-all space-y-2.5 shadow-2xs">
                {/* Time & Doctor */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <HCPAvatar
                      name={item.doctorName}
                      size="xs"
                    />
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {item.time || "09:42"}
                    </span>
                    <span className="font-bold text-slate-900 text-sm group-hover:text-teal-800 transition">
                      {item.doctorName}
                    </span>
                    {item.specialty && (
                      <Badge variant={item.specialty} size="xs">
                        {item.specialty}
                      </Badge>
                    )}
                    {item.sentiment && (
                      <Badge variant={item.sentiment} size="xs" dot>
                        {item.sentiment}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {item.date}
                  </span>
                </div>

                {/* What happened summary */}
                <p className="text-slate-800 leading-relaxed text-xs sm:text-sm">
                  {item.aiSummary?.summary || item.rawNotes}
                </p>

                {/* Products & Intent */}
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/60 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap text-slate-500">
                    <span className="font-medium text-slate-600">Product:</span>
                    {(item.products || ["CardioPlus 50mg"]).map((p, pIdx) => (
                      <span
                        key={pIdx}
                        className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-800 font-semibold shadow-2xs"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  {item.aiSummary?.followUpAction && (
                    <span className="text-teal-800 font-semibold flex items-center gap-1.5 shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      Follow-up pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No recent interaction changes found matching filter.
          </div>
        )}
      </div>
    </div>
  );
}