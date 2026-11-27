import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Hospital,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Clock,
  Sparkles,
  MessageSquare,
  Building,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  FileText,
  Activity,
  Award,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import Drawer from "../common/Drawer";
import Badge from "../common/Badge";
import Button from "../common/Button";
import HCPAvatar from "../common/HCPAvatar";
import { placeLabel, relationshipInfo } from "../../utils/hcpHealth";
import { monthDay, pluralize } from "../../utils/format";

export default function HCPDetailDrawer({
  isOpen,
  onClose,
  doctor,
  onLogInteraction,
  onEdit,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); // overview, history, products, ai_strategy
  const interactions = useSelector((state) => state.interaction.items);

  if (!doctor) return null;

  // Filter interactions for this doctor
  const doctorInteractions = interactions.filter(
    (item) =>
      item.doctorName?.toLowerCase() === doctor.name?.toLowerCase() ||
      item.hcpId === doctor.id
  );

  const rel = relationshipInfo(doctor);

  // Product adoption derived from this doctor's logged interactions (no invented stages or percentages).
  const productStats = new Map();
  for (const name of doctor.productsOfInterest || [])
    productStats.set(name, { product: name, count: 0, last: null, sentiment: null });
  for (const int of doctorInteractions) {
    for (const name of int.products || []) {
      const row = productStats.get(name) || { product: name, count: 0, last: null, sentiment: null };
      row.count += 1;
      if (!row.last || int.date > row.last) {
        row.last = int.date;
        row.sentiment = int.sentiment;
      }
      productStats.set(name, row);
    }
  }
  const productRows = [...productStats.values()].sort((x, y) => y.count - x.count);

  const objections = doctorInteractions
    .filter((i) => i.objections)
    .map((i) => ({ date: i.date, text: i.objections }));
  const latest = doctorInteractions[0];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-2xl"
      title={doctor.name}
      subtitle={`${doctor.specialty} • ${doctor.hospital}`}
      footer={
        <div className="flex items-center justify-between gap-2.5">
          <Button variant="outline" size="sm" onClick={() => onEdit(doctor)}>
            Edit Profile
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={MessageSquare}
            onClick={() => {
              onClose();
              onLogInteraction(doctor);
            }}
          >
            Log Detailing Visit
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-sm">
        {/* Doctor Executive Header Profile */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4 relative overflow-hidden shadow-lg">
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5 min-w-0">
              <HCPAvatar
                src={doctor.avatar}
                name={doctor.name}
                size="xl"
              />

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-white leading-tight truncate">
                    {doctor.name}
                  </h2>
                  <Badge variant={rel.health} size="sm" dot>
                    {rel.health}
                  </Badge>
                  {doctor.tier === "Tier 1" && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-teal-950 text-teal-300 border border-teal-800 font-semibold">
                      Tier 1 KOL
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 font-medium truncate">
                  {doctor.qualification} • {doctor.specialty}
                </p>

                <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate pt-0.5">
                  <Hospital className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  {doctor.hospital}
                </p>
              </div>
            </div>

            {/* Relationship Pulse Score Box */}
            <div className="text-right shrink-0 bg-slate-950/90 p-3 rounded-xl border border-slate-800 font-mono shadow-inner">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Activity (30d)</span>
              <p
                className={`text-base font-extrabold mt-0.5 ${
                  rel.trendType === "up" ? "text-teal-400" : "text-slate-300"
                }`}
              >
                {pluralize(doctor.interactionsLast30Days || 0, "visit")}
              </p>
              <span className="text-xs text-slate-400 font-medium">Health: {rel.score}/100</span>
            </div>
          </div>

          {/* Quick Context Summary */}
          <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
            <div>
              <span>Last Touch:</span>{" "}
              <strong className="text-slate-200 font-semibold">{rel.lastTouch}</strong>
            </div>
            <div>
              <span>Tier:</span>{" "}
              <strong className="text-teal-400 font-semibold">{doctor.tier || "-"}</strong>
            </div>
            <div className="text-right">
              <span>Logs:</span>{" "}
              <strong className="text-slate-200 font-semibold">{pluralize(doctorInteractions.length, "Session")}</strong>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-px text-sm overflow-x-auto custom-scrollbar">
          {[
            { id: "overview", label: "Overview & Logistics" },
            { id: "history", label: `Detailing History (${doctorInteractions.length})` },
            { id: "products", label: "Products Discussed" },
            { id: "ai_strategy", label: "CRM Briefing" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & LOGISTICS */}
        {activeTab === "overview" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
                <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Clinical Department
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {doctor.specialty} Department
                </p>
                <p className="text-xs text-slate-500">
                  {doctor.department || "Not recorded"}
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
                <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Monthly Prescribing Potential
                </p>
                <p className="text-sm font-bold text-teal-800">
                  {doctor.prescribingPotential || "Not recorded"}
                </p>
                <p className="text-xs text-slate-500">
                  Priority: {doctor.priority}
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
                <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Direct Contact Channels
                </p>
                <p className="text-xs text-slate-800 flex items-center gap-2 font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {doctor.email || "Not recorded"}
                </p>
                <p className="text-xs text-slate-800 flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {doctor.phone || "Not recorded"}
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
                <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Preferred Visit Window
                </p>
                <p className="text-xs text-slate-800 flex items-center gap-2 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {doctor.preferredTime || "Not recorded"}
                </p>
                <p className="text-xs text-slate-500">
                  Location: {placeLabel(doctor)}
                </p>
              </div>
            </div>

            {/* Rep Notes */}
            {doctor.notes && (
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Field Rep Territory Observations
                </h4>
                <p className="text-slate-800 leading-relaxed text-sm">
                  {doctor.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DETAILING HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-3.5 animate-fade-in">
            {doctorInteractions.length > 0 ? (
              <div className="space-y-3">
                {doctorInteractions.map((int) => (
                  <div
                    key={int.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white card-shadow space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                          {int.date}
                        </span>
                        <Badge variant={int.sentiment} size="xs" dot>
                          {int.sentiment}
                        </Badge>
                        <span className="text-xs text-slate-500 font-medium">
                          {int.visitType}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {int.time}
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs sm:text-sm">
                      {int.aiSummary?.summary || int.rawNotes}
                    </p>

                    {int.aiSummary?.followUpAction && (
                      <div className="text-xs text-teal-800 font-semibold flex items-center gap-2 pt-1 border-t border-slate-100">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        Next Action: {int.aiSummary.followUpAction}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/80 rounded-xl border border-dashed border-slate-200">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">
                  No interactions recorded yet
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Click the button below to log your detailing notes.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRODUCTS DISCUSSED (from logged interactions) */}
        {activeTab === "products" && (
          <div className="space-y-3.5 animate-fade-in">
            {productRows.length > 0 ? (
              productRows.map((row) => (
                <div
                  key={row.product}
                  className="p-4 rounded-xl border border-slate-200 bg-white card-shadow flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">{row.product}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {row.last ? `Last discussed ${monthDay(row.last)}` : "Not discussed yet"}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm">
                      {pluralize(row.count, "discussion")}
                    </span>
                    {row.sentiment && (
                      <div>
                        <Badge variant={row.sentiment} size="xs" dot>
                          {row.sentiment}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-50/80 rounded-xl border border-dashed border-slate-200">
                <p className="font-bold text-slate-700 text-sm">No products recorded</p>
                <p className="text-xs text-slate-400 mt-1">
                  Products appear here once they are listed on the profile or discussed in a logged visit.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CRM BRIEFING (assembled from stored data only) */}
        {activeTab === "ai_strategy" && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 space-y-3 shadow-md">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-300" />
                Briefing From Your CRM Data
              </h4>
              <ul className="space-y-2.5 text-slate-200 leading-relaxed text-xs sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-white font-semibold">Last contact:</strong>{" "}
                    {latest
                      ? `${monthDay(latest.date)} (${latest.visitType}). ${latest.aiSummary?.summary || latest.rawNotes}`
                      : "No interactions logged yet."}
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-white font-semibold">Open follow-up:</strong>{" "}
                    {doctor.nextFollowUpAction
                      ? `${doctor.nextFollowUpAction} (due ${monthDay(doctor.nextFollowUpDate)}${
                          doctor.overdueFollowUps ? `, ${doctor.overdueFollowUps} overdue` : ""
                        })`
                      : "None."}
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-white font-semibold">Products of interest:</strong>{" "}
                    {(doctor.productsOfInterest || []).join(", ") || "None recorded."}
                  </div>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 stroke-[2]" />
                <h4>Recorded Objections</h4>
              </div>

              {objections.length > 0 ? (
                <div className="space-y-2.5">
                  {objections.map((o, idx) => (
                    <div key={idx} className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 text-sm space-y-1">
                      <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                        {monthDay(o.date)}
                      </span>
                      <p className="text-amber-950 text-xs sm:text-sm leading-relaxed">{o.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No objections have been recorded for this doctor.</p>
              )}
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate("/chat");
              }}
              className="w-full p-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold transition flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              Ask the AI Analyst about this doctor →
            </button>
          </div>
        )}
      </div>
    </Drawer>
  );
}
