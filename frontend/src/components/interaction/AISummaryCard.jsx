import React from "react";
import {
  Sparkles,
  CheckCircle2,
  Save,
  Copy,
  Activity,
  FileCheck,
  Building,
} from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import toast from "react-hot-toast";

export default function AISummaryCard({
  aiResult,
  isLoading,
  onSaveInteraction,
}) {
  const structured = aiResult?.structured;

  const handleCopySummary = () => {
    if (!structured) return;
    const text = `HCP: ${structured["Doctor Name"] || ""}\nHospital: ${
      structured["Hospital"] || ""
    }\nSummary: ${structured["Summary"] || ""}\nSentiment: ${
      structured["Sentiment"] || ""
    }\nFollow-up: ${structured["Follow-up Action"] || ""}`;
    navigator.clipboard.writeText(text);
    toast.success("AI Summary copied to clipboard!");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 card-shadow p-5 sm:p-6 flex flex-col h-full text-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/70 text-teal-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base tracking-tight">
              AI Detailing Intelligence
            </h3>
            <p className="text-xs text-slate-500">Autonomous extraction via LangGraph + Groq</p>
          </div>
        </div>

        {structured && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
              LangGraph Verified
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between space-y-4">
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mx-auto animate-spin">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                LangGraph Agent Reasoning...
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Extracting clinical entities, sentiment alignment, and optimal next follow-up action.
              </p>
            </div>
          </div>
        ) : structured ? (
          <div className="space-y-4 animate-fade-in">
            {/* Extracted Doctor & Sentiment Row */}
            <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <div className="min-w-0">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Target HCP & Hospital
                </p>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate mt-0.5">
                  {structured["Doctor Name"] || "Healthcare Professional"}
                </h4>
                <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                  {structured["Hospital"] || "Hospital / Clinic"}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Sentiment
                </p>
                <Badge
                  variant={structured["Sentiment"] || "Positive"}
                  size="md"
                  dot
                >
                  {structured["Sentiment"] || "Positive"}
                </Badge>
              </div>
            </div>

            {/* Key Summary */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Executive Detailing Summary
              </h5>
              <p className="text-slate-800 leading-relaxed text-xs sm:text-sm">
                {structured["Summary"]}
              </p>
            </div>

            {/* Follow-up Action */}
            {structured["Follow-up Action"] && (
              <div className="p-4 bg-teal-50/80 rounded-xl border border-teal-200/90 space-y-1.5 shadow-2xs">
                <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  Recommended Commercial Action
                </h5>
                <p className="text-teal-950 font-semibold leading-relaxed text-xs sm:text-sm">
                  {structured["Follow-up Action"]}
                </p>
              </div>
            )}

            {/* Products Discussed Pills */}
            {structured["Products Discussed"] && (
              <div>
                <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Products Extracted
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(structured["Products Discussed"]) ? (
                    structured["Products Discussed"].map((p, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-white text-slate-800 font-semibold border border-slate-200 shadow-2xs"
                      >
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-white text-slate-800 font-semibold border border-slate-200 shadow-2xs">
                      {structured["Products Discussed"]}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-14 text-center space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">
              AI Intelligence Layer Ready
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Enter detailing notes on the left or select a rapid scenario template, then click <strong>"Extract Clinical Intelligence"</strong>.
            </p>
          </div>
        )}

        {/* Save to CRM History Button */}
        {structured && !isLoading && (
          <div className="pt-2 border-t border-slate-100">
            <Button
              variant="primary"
              size="lg"
              icon={Save}
              onClick={onSaveInteraction}
              className="w-full text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
            >
              Commit to CRM & Update Territory Timeline
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
