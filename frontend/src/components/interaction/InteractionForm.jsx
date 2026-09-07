import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Sparkles,
  Mic,
  FileText,
  User,
  Calendar,
  Building,
} from "lucide-react";
import { updateActiveDraft } from "../../redux/slices/interactionSlice";
import { PRODUCTS_CATALOG } from "../../constants/mockData";
import Button from "../common/Button";
import toast from "react-hot-toast";

const QUICK_TEMPLATES = [
  {
    title: "CardioPlus 50mg Trial Detailing",
    doctor: "Dr. Rahul Sharma",
    hospital: "Apollo Hospital",
    specialty: "Cardiology",
    products: ["CardioPlus 50mg", "GlucoCare Duo"],
    notes:
      "Met Dr. Rahul Sharma at Apollo Hospital. Detailed the Phase-3 REDUCE-HF clinical trial outcomes highlighting 24% reduction in CV re-hospitalizations. The doctor was very positive about patient tolerability and asked for 15 trial starter packs. Also invited us to co-sponsor the upcoming hospital CME next month.",
  },
  {
    title: "NeuroGuard XR Objection Handling",
    doctor: "Dr. Priya Mehta",
    hospital: "Fortis Memorial Research Institute",
    specialty: "Neurology",
    products: ["NeuroGuard XR"],
    notes:
      "Discussed NeuroGuard XR once-daily bedtime dosing advantages for diabetic neuropathy. Dr. Mehta raised concerns regarding patient price sensitivity compared to immediate-release generic formulations. Agreed to deliver pharmacoeconomic savings chart and 5 sample kits by next Tuesday.",
  },
  {
    title: "OncoShield 250 Formulary Review",
    doctor: "Dr. Rajesh Kulkarni",
    hospital: "AIIMS (All India Institute of Medical Sciences)",
    specialty: "Oncology",
    products: ["OncoShield 250"],
    notes:
      "Presented 5-year overall survival Kaplan-Meier data for OncoShield in EGFR-mutant NSCLC. Dr. Kulkarni confirmed that our drug is being scheduled for the institutional Pharmacy & Therapeutics (P&T) committee review on July 20. Requested comprehensive technical dossier by Friday.",
  },
];

export default function InteractionForm({ onGenerateAI, isLoading }) {
  const dispatch = useDispatch();
  const hcps = useSelector((state) => state.hcp.items);
  const draft = useSelector((state) => state.interaction.activeDraft);

  const [isRecording, setIsRecording] = useState(false);

  const handleDoctorSelect = (e) => {
    const selectedName = e.target.value;
    const foundDoc = hcps.find((h) => h.name === selectedName);
    if (foundDoc) {
      dispatch(
        updateActiveDraft({
          doctorName: foundDoc.name,
          hospital: foundDoc.hospital,
          specialty: foundDoc.specialty,
          products: foundDoc.productsOfInterest || ["CardioPlus 50mg"],
        })
      );
    } else {
      dispatch(updateActiveDraft({ doctorName: selectedName }));
    }
  };

  const handleApplyTemplate = (tpl) => {
    dispatch(
      updateActiveDraft({
        doctorName: tpl.doctor,
        hospital: tpl.hospital,
        specialty: tpl.specialty,
        products: tpl.products,
        rawNotes: tpl.notes,
      })
    );
    toast.success(`Loaded detailing draft: "${tpl.title}"`);
  };

  const toggleProduct = (prodName) => {
    const current = draft.products || [];
    const exists = current.includes(prodName);
    const updated = exists
      ? current.filter((p) => p !== prodName)
      : [...current, prodName];
    dispatch(updateActiveDraft({ products: updated }));
  };

  const handleVoiceSimulate = () => {
    setIsRecording(true);
    toast("Listening to rep voice dictation...", { icon: "🎙️" });
    setTimeout(() => {
      setIsRecording(false);
      dispatch(
        updateActiveDraft({
          rawNotes:
            draft.rawNotes +
            (draft.rawNotes ? "\n" : "") +
            "Doctor expressed keen interest in the once-daily formulation. Requested 10 patient starter packs and follow-up clinical brief by next Monday.",
        })
      );
      toast.success("Voice note transcribed!");
    }, 1500);
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
        {/* Rapid Scenarios */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Rapid Clinical Scenarios
            </label>
            <span className="text-xs text-teal-700 font-semibold font-mono">1-Click Pre-fill</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {QUICK_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="p-3 text-left rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/90 hover:border-slate-300 transition text-xs font-medium text-slate-700 truncate cursor-pointer shadow-2xs group"
              >
                <div className="font-bold text-slate-900 truncate group-hover:text-teal-800 transition">
                  {tpl.title}
                </div>
                <div className="text-xs text-slate-500 truncate mt-1 font-mono">
                  {tpl.doctor}
                </div>
              </button>
            ))}
          </div>
        </div>

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
              placeholder="e.g. Apollo Hospital"
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
            {PRODUCTS_CATALOG.map((p) => {
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
            <button
              type="button"
              onClick={handleVoiceSimulate}
              disabled={isRecording}
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1.5 cursor-pointer bg-teal-50 hover:bg-teal-100/80 px-2.5 py-1 rounded-lg border border-teal-200/70 transition"
            >
              <Mic className={`w-3.5 h-3.5 ${isRecording ? "text-rose-500 animate-pulse" : ""}`} />
              {isRecording ? "Transcribing..." : "Simulate Voice Dictation"}
            </button>
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