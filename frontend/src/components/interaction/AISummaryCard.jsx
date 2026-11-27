import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Sparkles,
  CheckCircle2,
  Save,
  Copy,
  AlertTriangle,
  RotateCcw,
  X,
} from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { updateAIDraft } from "../../redux/slices/interactionSlice";
import toast from "react-hot-toast";

const fieldClass =
  "w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs";
const labelClass =
  "block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5";

export default function AISummaryCard({
  aiResult,
  isLoading,
  error,
  onRetry,
  onSaveInteraction,
  isSaving,
}) {
  const dispatch = useDispatch();
  const hcps = useSelector((state) => state.hcp.items);
  const [newProduct, setNewProduct] = useState("");

  const d = aiResult?.draft;
  const hasResult = Boolean(d);
  const set = (fields) => dispatch(updateAIDraft(fields));
  const candidates = aiResult?.match?.candidates || [];
  const candidateIds = new Set(candidates.map((c) => c.id));
  const selectedHCP = hcps.find((h) => h.id === Number(d?.hcpId));

  const addProduct = () => {
    const name = newProduct.trim();
    if (name && !d.products.some((p) => p.toLowerCase() === name.toLowerCase())) {
      set({ products: [...d.products, name] });
    }
    setNewProduct("");
  };

  const handleCopySummary = () => {
    if (!hasResult) return;
    const text = [
      `HCP: ${selectedHCP?.name || ""}`,
      `Hospital: ${selectedHCP?.hospital || ""}`,
      `Summary: ${d.summary || ""}`,
      `Sentiment: ${d.sentiment || ""}`,
      `Products: ${d.products.join(", ")}`,
      `Objections: ${d.objectionsText || ""}`,
      `Follow-up: ${d.followUpDate || ""} ${d.followUpAction || ""}`.trim(),
    ].join("\n");
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

        {hasResult && !isLoading && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
            <span
              className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 border border-teal-200"
              title={`Model: ${aiResult.model} • Attempts: ${aiResult.attempts}`}
            >
              {aiResult.model} • {(aiResult.latencyMs / 1000).toFixed(1)}s
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
                Extracting clinical entities, sentiment, objections and follow-up date, then matching the HCP.
              </p>
            </div>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="py-12 text-center space-y-3 border border-rose-200 rounded-xl bg-rose-50/60 p-6"
          >
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
            <h4 className="text-sm font-bold text-rose-800">
              AI extraction failed
            </h4>
            <p className="text-xs text-rose-700 max-w-xs mx-auto leading-relaxed wrap-break-word">
              {error}
            </p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={onRetry}
                className="cursor-pointer"
              >
                Retry
              </Button>
            )}
          </div>
        ) : hasResult ? (
          <div className="space-y-4 animate-fade-in">
            <p className="text-xs text-slate-500">
              AI draft — review and edit before saving. Nothing is stored until you confirm.
            </p>

            {/* HCP & Sentiment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className={labelClass}>Healthcare Professional</label>
                <select
                  value={d.hcpId || ""}
                  onChange={(e) => set({ hcpId: e.target.value ? Number(e.target.value) : "" })}
                  className={fieldClass}
                >
                  <option value="">-- Select HCP --</option>
                  {candidates.length > 0 && (
                    <optgroup label="AI suggestions">
                      {candidates.map((c) => (
                        <option key={`c-${c.id}`} value={c.id}>
                          {c.name} ({c.hospital}) — {Math.round(c.score * 100)}% match
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="All HCPs">
                    {hcps
                      .filter((h) => !candidateIds.has(h.id))
                      .map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} ({h.hospital})
                        </option>
                      ))}
                  </optgroup>
                </select>
                {!d.hcpId && (
                  <p className="text-xs text-amber-700 mt-1 font-medium">
                    {aiResult.extracted?.hcpName
                      ? `AI read "${aiResult.extracted.hcpName}" but couldn't match it confidently. Pick the HCP.`
                      : "No doctor named in the notes. Pick the HCP."}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Sentiment</label>
                <select
                  value={d.sentiment}
                  onChange={(e) => set({ sentiment: e.target.value })}
                  className={fieldClass}
                >
                  <option value="Positive">Positive</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Negative">Negative</option>
                </select>
                <div className="mt-1.5">
                  <Badge variant={d.sentiment} size="xs" dot>
                    {d.sentiment}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className={labelClass}>Executive Detailing Summary</label>
              <textarea
                rows="3"
                value={d.summary}
                onChange={(e) => set({ summary: e.target.value })}
                className={`${fieldClass} leading-relaxed`}
              />
            </div>

            {/* Products */}
            <div>
              <label className={labelClass}>Products Discussed</label>
              <div className="flex flex-wrap gap-1.5">
                {d.products.map((p) => (
                  <span
                    key={p}
                    className="text-xs pl-2.5 pr-1 py-1 rounded-lg bg-white text-slate-800 font-semibold border border-slate-200 shadow-2xs flex items-center gap-1"
                  >
                    {p}
                    <button
                      type="button"
                      onClick={() => set({ products: d.products.filter((x) => x !== p) })}
                      className="p-0.5 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                      aria-label={`Remove ${p}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addProduct();
                    }
                  }}
                  onBlur={addProduct}
                  placeholder="+ Add product"
                  className="text-xs px-2.5 py-1 rounded-lg border border-dashed border-slate-300 bg-white w-32 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Objections */}
            <div>
              <label className={labelClass}>Objections (one per line)</label>
              <textarea
                rows="2"
                value={d.objectionsText}
                onChange={(e) => set({ objectionsText: e.target.value })}
                placeholder="None recorded"
                className={`${fieldClass} leading-relaxed placeholder:text-slate-400`}
              />
            </div>

            {/* Follow-up */}
            <div className="p-4 bg-teal-50/80 rounded-xl border border-teal-200/90 space-y-3 shadow-2xs">
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                Follow-up
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="date"
                  value={d.followUpDate || ""}
                  onChange={(e) => set({ followUpDate: e.target.value })}
                  className={fieldClass}
                  aria-label="Follow-up date"
                />
                <input
                  type="text"
                  value={d.followUpAction}
                  onChange={(e) => set({ followUpAction: e.target.value })}
                  placeholder="Action (optional)"
                  className={`${fieldClass} sm:col-span-2 placeholder:text-slate-400`}
                  aria-label="Follow-up action"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-14 text-center space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">
              AI Intelligence Layer Ready
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Enter detailing notes on the left, then click <strong>"Extract Clinical Intelligence"</strong>. You can review and edit the draft before saving.
            </p>
          </div>
        )}

        {/* Confirm & save */}
        {hasResult && !isLoading && !error && (
          <div className="pt-2 border-t border-slate-100">
            <Button
              variant="primary"
              size="lg"
              icon={Save}
              onClick={onSaveInteraction}
              isLoading={isSaving}
              disabled={!d.hcpId || isSaving}
              className="w-full text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
            >
              Confirm & Save to CRM
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
