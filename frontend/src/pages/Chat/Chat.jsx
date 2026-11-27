import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Sparkles,
  Send,
  User,
  Copy,
  RotateCcw,
  Lightbulb,
  ClipboardList,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  BrainCircuit,
} from "lucide-react";
import { askAI } from "../../services/interactionService";
import { updateActiveDraft } from "../../redux/slices/interactionSlice";
import { getInitials } from "../../components/common/HCPAvatar";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import toast from "react-hot-toast";

const SUGGESTED_PROMPTS = [
  "Which HCPs need attention today?",
  "Prepare talking points for Dr. Rahul Sharma on CardioPlus 50mg Phase-3 trial data.",
  "Summarize key objections regarding NeuroGuard XR pricing vs generics.",
  "What is the institutional strategy for OncoShield AIIMS P&T committee review?",
];

export default function Chat() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [messages, setMessages] = useState([
    {
      id: "msg-1",
      sender: "ai",
      type: "text",
      text: "Ask for clinical talking points, doctor background, objection handling, or territory priorities.",
      time: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const nowTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const requestAI = async (query) => {
    setIsLoading(true);
    try {
      const { raw, structured } = await askAI(query);
      const aiMsg = structured
        ? {
            id: `ai-${Date.now()}`,
            sender: "ai",
            type: "structured_insight",
            signal: structured["Doctor Name"]
              ? `Physician Intelligence: ${structured["Doctor Name"]}`
              : "AI Response",
            evidence: structured.Summary || null,
            interpretation: structured.Sentiment ? `Sentiment: ${structured.Sentiment}` : null,
            recommendation: structured["Follow-up Action"] || null,
            text: raw,
            time: nowTime(),
          }
        : { id: `ai-${Date.now()}`, sender: "ai", type: "text", text: raw, time: nowTime() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI request failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          type: "error",
          query,
          text: err?.response?.data?.detail || err?.message || "Request failed",
          time: nowTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, sender: "user", text: query, time: nowTime() },
    ]);
    setInputText("");
    requestAI(query);
  };

  const handleRetry = (errorMsg) => {
    if (isLoading) return;
    setMessages((prev) => prev.filter((m) => m.id !== errorMsg.id));
    requestAI(errorMsg.query);
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleInsertToInteraction = (msg) => {
    dispatch(
      updateActiveDraft({
        rawNotes: msg.text || msg.evidence,
      })
    );
    toast.success("Transferred to Detailing Log draft!");
    navigate("/interaction");
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "msg-1",
        sender: "ai",
        type: "text",
        text: "Workspace cleared. Ask any territory analysis, doctor briefing, or clinical strategy query below.",
        time: "Just now",
      },
    ]);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title="Clinical Intelligence Analyst & Strategy Workspace"
        subtitle="AI-native clinical decision support: Physician strategy dossiers, trial evidence synthesis, and objection handling."
        badge="Groq LangGraph Intelligence"
        breadcrumbs={[
          { label: "OmniHealth OS", path: "/" },
          { label: "AI Analyst" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={handleClearChat}
          >
            Clear Workspace
          </Button>
        }
      />

      {/* Suggested Intelligence Queries */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1.5 text-xs sm:text-sm">
        <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-teal-600" /> Analyst Queries:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="text-xs sm:text-sm px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all shrink-0 shadow-2xs cursor-pointer font-semibold"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Main Analyst Workspace Container */}
      <div className="h-[640px] flex flex-col bg-white rounded-2xl border border-slate-200/90 card-shadow overflow-hidden text-sm">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-3xl ${
                msg.sender === "user" ? "ml-auto" : "mr-auto"
              }`}
            >
              {msg.sender === "user" ? (
                <div className="flex items-start gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                    {getInitials(user?.fullName)}
                  </div>
                  <div className="bg-slate-900 text-white rounded-2xl rounded-tr-none p-4 leading-relaxed text-sm max-w-xl shadow-xs font-medium">
                    {msg.text}
                  </div>
                </div>
              ) : msg.type === "error" ? (
                <div
                  role="alert"
                  className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-bold text-rose-800 text-sm">AI service unavailable</p>
                    <p className="text-xs text-rose-700 wrap-break-word">{msg.text}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={RotateCcw}
                    onClick={() => handleRetry(msg)}
                    disabled={isLoading}
                    className="shrink-0 cursor-pointer"
                  >
                    Retry
                  </Button>
                </div>
              ) : msg.type === "text" ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/70 text-teal-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-none p-4 leading-relaxed text-sm text-slate-800 whitespace-pre-wrap wrap-break-word card-shadow">
                    {msg.text}
                  </div>
                </div>
              ) : (
                /* STRUCTURED INTELLIGENCE LAYER CARD */
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 card-shadow space-y-4">
                  {/* Signal Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/70 text-teal-700 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                          Clinical Signal
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                          {msg.signal || "Territory Intelligence Synthesis"}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Evidence & Interpretation Block */}
                  {msg.evidence && (
                    <div className="space-y-1.5 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
                        Evidence & Data Points:
                      </span>
                      <p className="text-slate-800 leading-relaxed text-xs sm:text-sm font-sans">
                        {msg.evidence}
                      </p>
                    </div>
                  )}

                  {msg.interpretation && (
                    <div className="space-y-1.5 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-800 block">
                        Strategic Interpretation:
                      </span>
                      <p className="text-slate-800 leading-relaxed text-xs sm:text-sm font-sans">
                        {msg.interpretation}
                      </p>
                    </div>
                  )}

                  {msg.recommendation && (
                    <div className="p-4 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 space-y-1.5 shadow-xs">
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Recommended Action:
                      </span>
                      <p className="text-slate-200 leading-relaxed text-xs sm:text-sm font-medium">
                        {msg.recommendation}
                      </p>
                    </div>
                  )}

                  {!msg.evidence && !msg.interpretation && !msg.recommendation && (
                    <p className="text-slate-800 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap wrap-break-word">
                      {msg.text}
                    </p>
                  )}

                  {/* Action Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs font-mono">
                    <span>{msg.time}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.text || msg.evidence)}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 cursor-pointer font-medium"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Dossier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertToInteraction(msg)}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/70 transition flex items-center gap-1.5 cursor-pointer font-bold shadow-2xs"
                      >
                        <ClipboardList className="w-3.5 h-3.5" /> To Detailing Log
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 max-w-2xl mr-auto space-y-2 card-shadow">
              <div className="flex items-center gap-2.5 text-teal-700 font-semibold text-sm">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Synthesizing Clinical Evidence & Territory Data...</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Evaluating trial registries, physician history, and commercial milestones with LangGraph.
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask for clinical talking points, doctor background, objection handling, or territory priority..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-2xs placeholder:text-slate-400 font-medium"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={Send}
              disabled={!inputText.trim() || isLoading}
              className="text-sm font-bold shadow-xs px-5 cursor-pointer"
            >
              Analyze
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}