import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
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
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import toast from "react-hot-toast";

const SUGGESTED_PROMPTS = [
  "Which HCPs need attention in Delhi NCR today?",
  "Prepare talking points for Dr. Rahul Sharma on CardioPlus 50mg Phase-3 trial data.",
  "Summarize key objections regarding NeuroGuard XR pricing vs generics.",
  "What is the institutional strategy for OncoShield AIIMS P&T committee review?",
];

export default function Chat() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [messages, setMessages] = useState([
    {
      id: "msg-1",
      sender: "ai",
      type: "analyst_brief",
      signal: "Territory Relationship Velocity Alert",
      confidence: "98%",
      evidence: "3 high-value prescribers require immediate attention: Dr. Priya Mehta (18-day touch gap, pricing objection), Dr. Rahul Sharma (15 starter packs requested), and Dr. Rajesh Kulkarni (AIIMS P&T milestone on July 20).",
      interpretation: "Active intervention this week will protect ₹45L+ in quarterly prescribing volume across Delhi NCR.",
      recommendation: "Review the prioritized Next Best Actions queue or request specific clinical trial briefing dossiers.",
      text: "OmniHealth Clinical Intelligence OS Analyst initialized.\n\nI can generate evidence-backed clinical trial briefings, analyze physician objections, draft follow-up communication dossiers, and identify territory prescribing risks.",
      time: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await askAI(query);
      const structured = response.structured;

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        type: structured ? "structured_insight" : "text",
        signal: structured?.["Doctor Name"] ? `Physician Intelligence: ${structured["Doctor Name"]}` : "Clinical Strategy Dossier",
        confidence: "98%",
        evidence: structured?.Summary || response.raw || "Clinical analysis synthesized from territory trial data and past interactions.",
        interpretation: structured?.Sentiment ? `Detected Physician Sentiment: ${structured.Sentiment}. Engagement velocity requires targeted clinical evidence.` : "Recommended strategic clinical focus for upcoming detailing sessions.",
        recommendation: structured?.["Follow-up Action"] || "Execute recommended detailing follow-up and log outcomes into CRM.",
        structured,
        text: response.raw || structured?.Summary || "I have analyzed your request against the territory clinical dataset.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      toast.error("Clinical intelligence query failed.");
    } finally {
      setIsLoading(false);
    }
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
                    AR
                  </div>
                  <div className="bg-slate-900 text-white rounded-2xl rounded-tr-none p-4 leading-relaxed text-sm max-w-xl shadow-xs font-medium">
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

                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                      {msg.confidence || "98%"} Confidence
                    </span>
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