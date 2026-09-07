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

  const getRelationshipInfo = (doc) => {
    if (doc.priority === "High" && doc.status === "Active") {
      return { health: "Strong", momentum: "↑ 18%", trendType: "up", score: 92 };
    }
    if (doc.priority === "High" && doc.status === "Follow-up") {
      return { health: "At Risk", momentum: "↓ 14%", trendType: "down", score: 64 };
    }
    if (doc.status === "Follow-up") {
      return { health: "Watch", momentum: "→ 0%", trendType: "neutral", score: 72 };
    }
    return { health: "Healthy", momentum: "↑ 8%", trendType: "up", score: 84 };
  };

  const rel = getRelationshipInfo(doctor);

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
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Momentum</span>
              <p
                className={`text-base font-extrabold mt-0.5 ${
                  rel.trendType === "up"
                    ? "text-teal-400"
                    : rel.trendType === "down"
                    ? "text-rose-400"
                    : "text-slate-300"
                }`}
              >
                {rel.momentum}
              </p>
              <span className="text-xs text-slate-400 font-medium">Score: {rel.score}/100</span>
            </div>
          </div>

          {/* Quick Context Summary */}
          <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
            <div>
              <span>Last Touch:</span>{" "}
              <strong className="text-slate-200 font-semibold">{doctor.lastVisit || "4 days ago"}</strong>
            </div>
            <div>
              <span>Potential:</span>{" "}
              <strong className="text-teal-400 font-semibold">Top 10%</strong>
            </div>
            <div className="text-right">
              <span>Logs:</span>{" "}
              <strong className="text-slate-200 font-semibold">{doctorInteractions.length} Sessions</strong>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-px text-sm overflow-x-auto custom-scrollbar">
          {[
            { id: "overview", label: "Overview & Logistics" },
            { id: "history", label: `Detailing History (${doctorInteractions.length})` },
            { id: "products", label: "Product Adoption Matrix" },
            { id: "ai_strategy", label: "AI Briefing & Strategy" },
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
                  {doctor.department || "Main Outpatient OPD"}
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
                <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Monthly Prescribing Potential
                </p>
                <p className="text-sm font-bold text-teal-800">
                  {doctor.prescribingPotential || "High Potential (₹15L+/month)"}
                </p>
                <p className="text-xs text-slate-500">
                  Territory Priority: High Prescriber
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
                <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Direct Contact Channels
                </p>
                <p className="text-xs text-slate-800 flex items-center gap-2 font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {doctor.email || "doctor@hospital.org"}
                </p>
                <p className="text-xs text-slate-800 flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {doctor.phone || "+91 98000 00000"}
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
                <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Preferred Visit Window
                </p>
                <p className="text-xs text-slate-800 flex items-center gap-2 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {doctor.preferredTime || "Tuesdays & Thursdays, 2:00 - 4:00 PM"}
                </p>
                <p className="text-xs text-slate-500">
                  Location: {doctor.city}, {doctor.state}
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
                        {int.time || "Logged"}
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

        {/* TAB 3: PRODUCT ADOPTION MATRIX */}
        {activeTab === "products" && (
          <div className="space-y-3.5 animate-fade-in">
            {[
              { product: "CardioPlus 50mg", stage: "Regular Prescriber", volume: "High", interest: "94%", step: 4 },
              { product: "GlucoCare Duo", stage: "Clinical Evaluation", volume: "Medium", interest: "85%", step: 3 },
              { product: "OrthoFlex Plus", stage: "Sample Trial", volume: "Testing", interest: "65%", step: 2 },
              { product: "OncoShield 250", stage: "Formulary Review", volume: "Institutional", interest: "88%", step: 3 },
            ].map((prod, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-white card-shadow space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                      {prod.product}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Stage: <strong className="text-teal-700 font-semibold">{prod.stage}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-700 text-xs sm:text-sm">
                      {prod.interest} Alignment
                    </span>
                    <p className="text-xs text-slate-400">Vol: {prod.volume}</p>
                  </div>
                </div>

                {/* 4-Stage Adoption Progress Bar */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {["Awareness", "Evaluation", "Trial", "Prescribing"].map((stg, stgIdx) => (
                    <div key={stgIdx} className="space-y-1">
                      <div
                        className={`h-2 rounded-full ${
                          stgIdx < prod.step ? "bg-teal-500" : "bg-slate-200"
                        }`}
                      />
                      <span className="text-[10px] font-mono text-slate-500 font-medium block truncate">
                        {stg}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: AI BRIEFING & CLINICAL STRATEGY */}
        {activeTab === "ai_strategy" && (
          <div className="space-y-4 animate-fade-in">
            {/* Primary Strategy Brief */}
            <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-300" />
                  AI Clinical Briefing & Detailing Strategy
                </h4>
                <span className="text-xs font-mono text-teal-300 px-2.5 py-0.5 rounded-md bg-teal-950/80 border border-teal-800/80 font-semibold">
                  98% Confidence
                </span>
              </div>
              <ul className="space-y-2.5 text-slate-200 leading-relaxed text-xs sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-white font-semibold">Clinical Trial Focus:</strong> Highlight the recent REDUCE-HF Phase-3 cardiovascular outcomes data showing a 24% reduction in hospital re-admission.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-white font-semibold">Objection Mitigation:</strong> Address patient tolerability in geriatric cohorts (doctor has expressed past preference for minimal titration schedules).
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-white font-semibold">Actionable Commitment:</strong> Propose hospital CME co-sponsorship for their department in the upcoming quarter.
                  </div>
                </li>
              </ul>
            </div>

            {/* OBJECTION PLAYBOOK */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 stroke-[2]" />
                <h4>Physician Objection Playbook</h4>
              </div>

              <div className="space-y-2.5">
                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 text-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 text-xs sm:text-sm">
                      Objection: Generic Price Differential
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                      Common
                    </span>
                  </div>
                  <p className="text-amber-950 text-xs sm:text-sm leading-relaxed">
                    <strong className="font-semibold">Evidence Response:</strong> Present the pharmacoeconomic daily savings chart showing fewer re-hospitalizations offsets per-unit medication cost by ₹1,400/month.
                  </p>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      Objection: Patient Titration Complexity
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold">
                      Clinical
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                    <strong className="font-semibold">Evidence Response:</strong> Provide simplified once-daily titration wheel and 15 patient starter kits for trial evaluation.
                  </p>
                </div>
              </div>
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
              Launch Deep Strategy Analysis in AI Copilot →
            </button>
          </div>
        )}
      </div>
    </Drawer>
  );
}
