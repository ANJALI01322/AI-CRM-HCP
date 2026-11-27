import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Sparkles,
  ClipboardList,
  Search,
  Building,
  Calendar,
  Trash2,
  Download,
} from "lucide-react";
import {
  addInteraction,
  deleteInteraction,
  setCurrentAIResult,
  setIsGeneratingAI,
  fetchInteractions,
} from "../../redux/slices/interactionSlice";
import { fetchHCPs } from "../../redux/slices/hcpSlice";
import { addNotification } from "../../redux/slices/uiSlice";
import { extractInteraction } from "../../services/interactionService";
import { downloadCsv, errorMessage } from "../../services/crmApi";
import PageHeader from "../../components/common/PageHeader";
import InteractionForm from "../../components/interaction/InteractionForm";
import AISummaryCard from "../../components/interaction/AISummaryCard";
import Card, { CardHeader, CardTitle, CardContent } from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import toast from "react-hot-toast";

export default function Interaction() {
  const dispatch = useDispatch();

  const draft = useSelector((state) => state.interaction.activeDraft);
  const currentAIResult = useSelector(
    (state) => state.interaction.currentAIResult
  );
  const isGeneratingAI = useSelector(
    (state) => state.interaction.isGeneratingAI
  );
  const interactions = useSelector((state) => state.interaction.items);
  const interactionsStatus = useSelector((state) => state.interaction.status);
  const interactionsError = useSelector((state) => state.interaction.error);
  const hcps = useSelector((state) => state.hcp.items);

  const [filterSentiment, setFilterSentiment] = useState("All");
  const [searchHistory, setSearchHistory] = useState("");
  const [aiError, setAiError] = useState(null);

  const capitalize = (v) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : v);

  const handleGenerateAI = async () => {
    if (!draft.rawNotes?.trim()) {
      toast.error("Please enter interaction notes before generating AI summary.");
      return;
    }

    setAiError(null);
    dispatch(setCurrentAIResult(null));
    dispatch(setIsGeneratingAI(true));

    const selected = hcps.find((h) => h.name === draft.doctorName);
    const promptText = selected
      ? `Doctor: ${selected.name} (${selected.hospital})\n${draft.rawNotes}`
      : draft.rawNotes;

    try {
      const { draft: ai, match, model, latencyMs, attempts } = await extractInteraction(promptText);
      // The rep's own selections win; AI fills what they left empty.
      dispatch(
        setCurrentAIResult({
          extracted: { hcpName: ai.hcpName, hospital: ai.hospital },
          match,
          model,
          latencyMs,
          attempts,
          draft: {
            hcpId: selected?.id ?? match.hcpId ?? "",
            products: ai.products.length ? ai.products : draft.products || [],
            sentiment: capitalize(ai.sentiment),
            objectionsText: ai.objections.join("\n"),
            followUpDate: draft.followUpDate || ai.followUpDate || "",
            followUpAction: "",
            summary: ai.summary,
          },
        })
      );
    } catch (err) {
      console.error("AI request failed:", err);
      setAiError(errorMessage(err));
    } finally {
      dispatch(setIsGeneratingAI(false));
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToCRM = async () => {
    if (isSaving) return;
    const aiDraft = currentAIResult?.draft;
    if (!aiDraft) {
      toast.error("No AI draft to save.");
      return;
    }
    const hcp = hcps.find((h) => h.id === Number(aiDraft.hcpId));
    if (!hcp) {
      toast.error("Select the HCP for this interaction before saving.");
      return;
    }
    if (!aiDraft.summary?.trim()) {
      toast.error("Summary cannot be empty.");
      return;
    }

    const objections = (aiDraft.objectionsText || "")
      .split("\n")
      .map((o) => o.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      await dispatch(
        addInteraction({
          hcpId: hcp.id,
          channel: draft.visitType || "In-Person Detailing",
          products: aiDraft.products,
          notes: draft.rawNotes,
          sentiment: aiDraft.sentiment,
          objections: objections.length ? objections.join("; ") : null,
          followUpDate: aiDraft.followUpDate || null,
          summary: aiDraft.summary.trim(),
          followUpAction: aiDraft.followUpAction?.trim() || null,
        })
      ).unwrap();
    } catch (err) {
      toast.error(`Could not save interaction: ${err}`);
      return;
    } finally {
      setIsSaving(false);
    }

    // Server updated the HCP's last visit and interaction count.
    dispatch(fetchHCPs());

    dispatch(
      addNotification({
        title: `Detailing Logged: ${hcp.name}`,
        description:
          aiDraft.followUpAction ||
          `Detailing session recorded at ${hcp.hospital} with ${aiDraft.sentiment} sentiment.`,
        type: aiDraft.sentiment === "Positive" ? "success" : "ai",
      })
    );

    toast.success("Interaction saved to CRM & Territory Timeline!");
  };

  const filteredHistory = interactions.filter((item) => {
    const matchesSearch =
      !searchHistory.trim() ||
      item.doctorName?.toLowerCase().includes(searchHistory.toLowerCase()) ||
      item.hospital?.toLowerCase().includes(searchHistory.toLowerCase()) ||
      item.rawNotes?.toLowerCase().includes(searchHistory.toLowerCase());

    const matchesSentiment =
      filterSentiment === "All" || item.sentiment === filterSentiment;

    return matchesSearch && matchesSentiment;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Interaction Intelligence Studio"
        subtitle="Capture field conversations. Let AI convert raw observations into structured clinical intelligence & follow-up directives."
        badge="LangGraph + Groq Clinical Agent"
        breadcrumbs={[
          { label: "OmniHealth CRM", path: "/" },
          { label: "Interactions", path: "/interaction" },
          { label: "Detailing Studio" },
        ]}
      />

      {/* VISUAL WORKFLOW STEP BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 card-shadow p-3.5 sm:p-4 overflow-x-auto custom-scrollbar">
        <div className="flex items-center justify-between min-w-[620px] gap-2">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center shadow-xs">
              01
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Select HCP</p>
              <p className="text-[11px] text-slate-500">Target Physician</p>
            </div>
          </div>

          <span className="text-slate-300 font-mono text-xs">━━━━━━━━</span>

          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center shadow-xs">
              02
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Context</p>
              <p className="text-[11px] text-slate-500">Channel & Date</p>
            </div>
          </div>

          <span className="text-slate-300 font-mono text-xs">━━━━━━━━</span>

          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center shadow-xs">
              03
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Capture</p>
              <p className="text-[11px] text-slate-500">Notes or Dictation</p>
            </div>
          </div>

          <span className="text-slate-300 font-mono text-xs">━━━━━━━━</span>

          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-xl bg-teal-500 text-slate-950 font-mono text-xs font-bold flex items-center justify-center shadow-xs animate-pulse">
              04
            </span>
            <div>
              <p className="text-xs font-bold text-teal-800 uppercase font-mono tracking-wider">AI Analysis</p>
              <p className="text-[11px] text-teal-700 font-semibold">Structured Extraction</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column AI Intelligence Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Left Column: Form */}
        <InteractionForm
          onGenerateAI={handleGenerateAI}
          isLoading={isGeneratingAI}
        />

        {/* Right Column: AI Extraction Output */}
        <AISummaryCard
          aiResult={currentAIResult}
          isLoading={isGeneratingAI}
          error={aiError}
          onRetry={handleGenerateAI}
          onSaveInteraction={handleSaveToCRM}
          isSaving={isSaving}
        />
      </div>

      {/* Logged Interactions History Table */}
      <Card className="mt-6 rounded-2xl border border-slate-200/90 card-shadow overflow-hidden">
        <CardHeader
          action={
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const filename = await downloadCsv("/export/interactions.csv");
                    toast.success(`Exported ${filename}`);
                  } catch (err) {
                    toast.error(`Export failed: ${err?.message || "Request failed"}`);
                  }
                }}
                className="text-xs sm:text-sm px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 shadow-2xs hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  className="text-xs sm:text-sm pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs"
                />
              </div>

              {/* Sentiment filter */}
              <select
                value={filterSentiment}
                onChange={(e) => setFilterSentiment(e.target.value)}
                className="text-xs sm:text-sm px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="All">All Sentiments</option>
                <option value="Positive">Positive</option>
                <option value="Neutral">Neutral</option>
                <option value="Negative">Negative</option>
              </select>
            </div>
          }
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-700 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <CardTitle>Historical Detailing Logs ({interactions.length})</CardTitle>
              <p className="text-xs text-slate-500">Chronological repository of physician detailing history</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredHistory.length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto custom-scrollbar text-sm">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-all duration-150 flex flex-col sm:flex-row sm:items-start justify-between gap-3.5"
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">
                        {item.doctorName}
                      </span>
                      {item.specialty && (
                        <Badge variant={item.specialty} size="xs">
                          {item.specialty}
                        </Badge>
                      )}
                      <Badge variant={item.sentiment} size="xs" dot>
                        {item.sentiment}
                      </Badge>
                      <span className="text-xs text-slate-500 font-medium font-mono">
                        {item.visitType}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {item.hospital}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {item.date} {item.time ? `• ${item.time}` : ""}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 text-slate-800 leading-relaxed text-xs sm:text-sm">
                      <strong className="font-semibold text-slate-900">AI Summary:</strong>{" "}
                      {item.aiSummary?.summary || item.rawNotes}
                    </div>

                    {item.aiSummary?.followUpAction && (
                      <div className="text-xs text-teal-800 font-semibold flex items-center gap-1.5 pt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        Action: {item.aiSummary.followUpAction}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await dispatch(deleteInteraction(item.id)).unwrap();
                        toast.success("Log record deleted.");
                        dispatch(fetchHCPs());
                      } catch (err) {
                        toast.error(`Could not delete log: ${err}`);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition self-end sm:self-auto shrink-0 cursor-pointer"
                    title="Delete log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : interactions.length === 0 &&
            (interactionsStatus === "idle" || interactionsStatus === "loading") ? (
            <div className="p-10 text-center text-sm text-slate-400">
              Loading interaction logs...
            </div>
          ) : interactions.length === 0 && interactionsStatus === "failed" ? (
            <div role="alert" className="p-10 text-center text-sm text-slate-400">
              Could not load interaction logs: {interactionsError}{" "}
              <button
                type="button"
                onClick={() => dispatch(fetchInteractions())}
                className="font-semibold text-teal-700 hover:underline cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-slate-400">
              No historical interaction logs found matching filter.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}