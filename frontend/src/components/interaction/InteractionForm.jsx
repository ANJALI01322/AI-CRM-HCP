import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Sparkles, Mic, FileText } from "lucide-react";
import { updateActiveDraft } from "../../redux/slices/interactionSlice";
import Button from "../common/Button";
import toast from "react-hot-toast";

const SpeechRecognition =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export default function InteractionForm({ onGenerateAI, isLoading }) {
  const dispatch = useDispatch();
  const hcps = useSelector((state) => state.hcp.items);
  const draft = useSelector((state) => state.interaction.activeDraft);
  const products = useSelector((state) => state.catalog.products);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const notesRef = useRef(draft.rawNotes || "");
  notesRef.current = draft.rawNotes || "";

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const handleDoctorSelect = (e) => {
    const selectedName = e.target.value;
    const foundDoc = hcps.find((h) => h.name === selectedName);
    if (foundDoc) {
      dispatch(
        updateActiveDraft({
          doctorName: foundDoc.name,
          hospital: foundDoc.hospital,
          specialty: foundDoc.specialty,
          products: foundDoc.productsOfInterest || [],
        })
      );
    } else {
      dispatch(updateActiveDraft({ doctorName: selectedName }));
    }
  };

  const toggleProduct = (prodName) => {
    const current = draft.products || [];
    const exists = current.includes(prodName);
    const updated = exists
      ? current.filter((p) => p !== prodName)
      : [...current, prodName];
    dispatch(updateActiveDraft({ products: updated }));
  };

  // Real browser speech-to-text (Web Speech API); the button is hidden where unsupported.
  const handleDictation = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .slice(event.resultIndex)
        .map((r) => r[0].transcript.trim())
        .join(" ")
        .trim();
      if (text) {
        const current = notesRef.current;
        dispatch(updateActiveDraft({ rawNotes: current ? `${current} ${text}` : text }));
      }
    };
    recognition.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        toast.error(`Voice dictation error: ${event.error}`);
      }
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    setIsRecording(true);
    recognition.start();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 card-shadow p-5 sm:p-6 flex flex-col h-full text-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/70 text-teal-700 flex items-center justify-center">
            <FileText className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base tracking-tight">
              Detailing Visit & Clinical Notes
            </h3>
            <p className="text-xs text-slate-500">Record detailing observations and field insights</p>
          </div>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
          Step 1: Input
        </span>
      </div>

      <div className="space-y-4 flex-1">
        {/* Doctor & Hospital Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase font-mono tracking-wider">
              Target Healthcare Professional <span className="text-rose-500">*</span>
            </label>
            <select
              value={draft.doctorName || ""}
              onChange={handleDoctorSelect}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs"
            >
              <option value="">-- Select Registered Doctor --</option>
              {hcps.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} ({d.specialty} - {d.hospital})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase font-mono tracking-wider">
              Affiliated Hospital / Institution
            </label>
            <input
              type="text"
              placeholder="Hospital or clinic name"
              value={draft.hospital || ""}
              onChange={(e) =>
                dispatch(updateActiveDraft({ hospital: e.target.value }))
              }
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Channel & Follow-up */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase font-mono tracking-wider">
              Interaction Channel
            </label>
            <select
              value={draft.visitType || "In-Person Detailing"}
              onChange={(e) =>
                dispatch(updateActiveDraft({ visitType: e.target.value }))
              }
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs"
            >
              <option value="In-Person Detailing">In-Person Clinic Visit</option>
              <option value="Hospital Grand Round">Hospital Grand Round / CME</option>
              <option value="Virtual Tele-detail">Virtual Tele-Detailing</option>
              <option value="Phone Follow-up">Phone Consultation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase font-mono tracking-wider">
              Follow-up Commitment Date
            </label>
            <input
              type="date"
              value={draft.followUpDate || ""}
              onChange={(e) =>
                dispatch(updateActiveDraft({ followUpDate: e.target.value }))
              }
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Products Discussed */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase font-mono tracking-wider">
            Products Discussed (Multi-Select)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {products.map((p) => {
              const isSelected = (draft.products || []).includes(p.name);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProduct(p.name)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-slate-900 text-white shadow-2xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {isSelected ? "✓ " : "+ "}
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interaction Notes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
              Detailing Notes & Doctor Feedback <span className="text-rose-500">*</span>
            </label>
            {SpeechRecognition && (
              <button
                type="button"
                onClick={handleDictation}
                className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1.5 cursor-pointer bg-teal-50 hover:bg-teal-100/80 px-2.5 py-1 rounded-lg border border-teal-200/70 transition"
              >
                <Mic className={`w-3.5 h-3.5 ${isRecording ? "text-rose-500 animate-pulse" : ""}`} />
                {isRecording ? "Listening… tap to stop" : "Voice Dictation"}
              </button>
            )}
          </div>
          <textarea
            rows="5"
            placeholder="Type or dictate visit details: clinical studies discussed, doctor questions/objections, starter sample requests, next steps..."
            value={draft.rawNotes || ""}
            onChange={(e) =>
              dispatch(updateActiveDraft({ rawNotes: e.target.value }))
            }
            className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-2xs leading-relaxed placeholder:text-slate-400"
          />
        </div>

        {/* Generate AI Summary CTA */}
        <div className="pt-1.5">
          <Button
            variant="primary"
            size="lg"
            icon={Sparkles}
            isLoading={isLoading}
            onClick={onGenerateAI}
            className="w-full text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
          >
            Extract Clinical Intelligence (LangGraph + Groq)
          </Button>
        </div>
      </div>
    </div>
  );
}