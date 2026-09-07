import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Users,
  CalendarCheck,
  ClipboardList,
  Activity,
  Plus,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  ArrowRight,
  Radio,
  ChevronRight,
} from "lucide-react";
import { fetchDashboardStats, updateScheduleStatus } from "../../redux/slices/dashboardSlice";
import { setSelectedHCP } from "../../redux/slices/hcpSlice";
import { updateActiveDraft } from "../../redux/slices/interactionSlice";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import ClinicalSignalCard from "../../components/common/ClinicalSignalCard";
import RecentActivity from "../../components/dashboard/RecentActivity";
import toast from "react-hot-toast";

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { stats, schedule } = useSelector((state) => state.dashboard);
  const hcps = useSelector((state) => state.hcp.items);
  const interactions = useSelector((state) => state.interaction.items);

  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateScheduleStatus({ id, status: newStatus }));
    toast.success(`Visit status updated to ${newStatus}`);
  };

  const handleNavigateToDoctor = (doctorName) => {
    const doctor = hcps.find(
      (h) => h.name.toLowerCase() === doctorName.toLowerCase()
    );
    if (doctor) {
      dispatch(setSelectedHCP(doctor));
      navigate("/hcp");
    } else {
      navigate("/hcp");
    }
  };

  const handleQuickLogForDoctor = (doctorName, hospital, specialty, products, defaultNotes) => {
    dispatch(
      updateActiveDraft({
        doctorName,
        hospital,
        specialty,
        products: products || ["CardioPlus 50mg"],
        rawNotes: defaultNotes || "",
      })
    );
    navigate("/interaction");
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Command & Breadcrumb Header */}
      <PageHeader
        title="Clinical Intelligence Command Center"
        subtitle="Real-time territory relationship velocity, predictive clinical next actions, and field detailing operations."
        badge="Live Territory Sync • Week 37"
        breadcrumbs={[{ label: "OmniHealth OS", path: "/" }, { label: "Command Overview" }]}
        actions={
          <>
            <Button
              variant="outline"
              size="md"
              icon={Users}
              onClick={() => navigate("/hcp")}
              className="font-semibold shadow-2xs"
            >
              HCP Intelligence ({hcps.length})
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => navigate("/interaction")}
              className="font-bold shadow-xs cursor-pointer"
            >
              Log Detailing Visit
            </Button>
          </>
        }
      />

      {/* HERO OPERATIONAL SURFACE: CLINICAL INTELLIGENCE COMMAND CENTER */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-7 sm:p-9 border border-slate-800/90 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative grid overlay & ambient radial glow */}
        <div className="absolute inset-0 bg-grid-mesh opacity-20 pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Territory Headline Column */}
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-800 text-teal-300 font-mono text-xs uppercase tracking-wider font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-xs" />
              <span>OMNIHEALTH • CLINICAL INTELLIGENCE OS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Your territory, translated into actionable clinical intelligence.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
              3 physician relationships require immediate clinical touchpoints today. Dr. Priya Mehta has an 18-day touch gap with pending pricing concerns, while Dr. Rahul Sharma is prepared for Phase-3 trial sample delivery.
            </p>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                type="button"
                onClick={() => navigate("/chat")}
                className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all duration-150 flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-slate-950" /> Launch AI Clinical Analyst
              </button>
              <button
                type="button"
                onClick={() => navigate("/interaction")}
                className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4 text-teal-400" /> Log Field Detailing
              </button>
            </div>
          </div>

          {/* Key Momentum Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3.5 shrink-0 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-8 lg:min-w-[240px]">
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase font-semibold">
                <span>Momentum Velocity</span>
                <span className="text-teal-400">↑ 12.4%</span>
              </div>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                +18.2 pts
              </p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-teal-400 h-full rounded-full" style={{ width: "84%" }} />
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase font-semibold">
                <span>Field Coverage</span>
                <span className="text-slate-300">Week 37</span>
              </div>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                74.2%
              </p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-sky-400 h-full rounded-full" style={{ width: "74.2%" }} />
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase font-semibold">
                <span>Active KOL Prescribers</span>
                <span className="text-emerald-400">Tier 1</span>
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                8 Doctors
              </p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: TERRITORY RELATIONSHIP HEALTH DISTRIBUTION BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 card-shadow p-5 sm:p-6 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600 stroke-[2.2]" />
              Territory Relationship Health Matrix
            </h3>
            <p className="text-xs text-slate-500">Distribution of 8 registered healthcare professionals by relationship engagement score</p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
            Overall Health: 84% (Strong)
          </span>
        </div>

        {/* Visual Stacked Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden gap-0.5 p-0.5">
          <div className="bg-emerald-500 h-full rounded-l-full transition-all duration-500" style={{ width: "50%" }} title="Strong: 4 Doctors (50%)" />
          <div className="bg-teal-500 h-full transition-all duration-500" style={{ width: "25%" }} title="Healthy: 2 Doctors (25%)" />
          <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: "12.5%" }} title="Watch: 1 Doctor (12.5%)" />
          <div className="bg-rose-500 h-full rounded-r-full transition-all duration-500" style={{ width: "12.5%" }} title="At Risk: 1 Doctor (12.5%)" />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-600 font-medium">Strong: <strong>4 Doctors</strong> (50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-500 shrink-0" />
            <span className="text-slate-600 font-medium">Healthy: <strong>2 Doctors</strong> (25%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <span className="text-slate-600 font-medium">Watch: <strong>1 Doctor</strong> (12.5%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
            <span className="text-slate-600 font-medium">At Risk: <strong>1 Doctor</strong> (12.5%)</span>
          </div>
        </div>
      </div>

      {/* METRIC STRIP: TERRITORY OPERATIONS WITH ACCENT GLOWS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 border-t-4 border-t-teal-500 card-shadow hover:card-shadow-hover transition-all duration-200 flex flex-col justify-between cursor-pointer" onClick={() => navigate("/hcp")}>
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <span>Registered HCPs</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
              {stats.total_hcps || hcps.length}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <span>↑ +8.5% territory growth</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 mt-2 block font-medium">18 Key Opinion Leaders in target</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 border-t-4 border-t-sky-500 card-shadow hover:card-shadow-hover transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <span>Today's Field Detailing</span>
            <CalendarCheck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
              {`${schedule.filter((s) => s.status === "Completed").length} / ${schedule.length}`}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-sky-700 font-semibold">
              <span>75% route completed</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 mt-2 block font-medium">4 doctor visits scheduled today</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 border-t-4 border-t-indigo-500 card-shadow hover:card-shadow-hover transition-all duration-200 flex flex-col justify-between cursor-pointer" onClick={() => navigate("/interaction")}>
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <span>Detailing Sessions</span>
            <ClipboardList className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
              {stats.interactions || interactions.length + 840}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-indigo-700 font-semibold">
              <span>↑ +14.2% AI extracted</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 mt-2 block font-medium">98% LangGraph confidence score</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 border-t-4 border-t-amber-500 card-shadow hover:card-shadow-hover transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <span>Follow-ups Due</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold font-mono text-amber-700 tabular-nums">
              {stats.followups || 31}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-800 font-semibold">
              <span>3 high priority pending</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 mt-2 block font-medium">CardioPlus & OncoShield pipelines</span>
        </div>
      </div>

      {/* SECTION 2: NEXT BEST ACTIONS OPERATING QUEUE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-teal-600 shadow-xs" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              NEXT BEST ACTIONS <span className="text-xs font-mono text-slate-400 font-semibold">OPERATING QUEUE</span>
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono font-semibold hidden sm:inline">
            Ranked by Commercial Velocity & Clinical Impact
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <ClinicalSignalCard
            index="01"
            type="risk"
            confidence={96}
            doctor={{
              name: "Dr. Priya Mehta",
              specialty: "Neurology",
              hospital: "Fortis Memorial Research Institute",
            }}
            why="18 days since last detailing visit. Doctor raised pricing resistance regarding NeuroGuard XR vs immediate-release generics."
            aiReasoning="Prescribing velocity at risk of dropping 25% if pharmacoeconomic daily savings comparison is not presented this week."
            actionLabel="Review Pricing Brief"
            onAction={() =>
              handleQuickLogForDoctor(
                "Dr. Priya Mehta",
                "Fortis Memorial Research Institute",
                "Neurology",
                ["NeuroGuard XR"],
                "Presented pharmacoeconomic daily savings comparison for NeuroGuard XR."
              )
            }
            onViewHCP={() => handleNavigateToDoctor("Dr. Priya Mehta")}
          />

          <ClinicalSignalCard
            index="02"
            type="opportunity"
            confidence={98}
            doctor={{
              name: "Dr. Rahul Sharma",
              specialty: "Cardiology",
              hospital: "Apollo Hospital",
            }}
            why="Doctor requested 15 CardioPlus starter trial packs and co-sponsorship draft for the upcoming August CME conference."
            aiReasoning="High engagement velocity. Strong clinical reception on REDUCE-HF trial data with low objection resistance."
            actionLabel="Deliver Samples & Log"
            onAction={() =>
              handleQuickLogForDoctor(
                "Dr. Rahul Sharma",
                "Apollo Hospital",
                "Cardiology",
                ["CardioPlus 50mg", "GlucoCare Duo"],
                "Delivered 15 CardioPlus starter packs to Dr. Sharma. Discussed CME sponsorship draft."
              )
            }
            onViewHCP={() => handleNavigateToDoctor("Dr. Rahul Sharma")}
          />

          <ClinicalSignalCard
            index="03"
            type="formulary"
            confidence={92}
            doctor={{
              name: "Dr. Rajesh Kulkarni",
              specialty: "Oncology",
              hospital: "AIIMS New Delhi",
            }}
            why="Institutional milestone: OncoShield scheduled for AIIMS Pharmacy & Therapeutics (P&T) committee review on July 20."
            aiReasoning="High-impact institutional opportunity. Formulary inclusion unlocks ₹35L+/month in regional oncology procurement."
            actionLabel="Submit P&T Dossier"
            onAction={() =>
              handleQuickLogForDoctor(
                "Dr. Rajesh Kulkarni",
                "AIIMS (All India Institute of Medical Sciences)",
                "Oncology",
                ["OncoShield 250"],
                "Submitted formal 5-year OS Kaplan-Meier technical dossier to AIIMS P&T review committee."
              )
            }
            onViewHCP={() => handleNavigateToDoctor("Dr. Rajesh Kulkarni")}
          />
        </div>
      </div>

      {/* SECTION 3: TODAY'S FIELD ROUTE & WHAT CHANGED TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Today's Schedule Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 card-shadow p-5 sm:p-6 flex flex-col h-full text-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <CalendarCheck className="w-5 h-5 text-teal-600 stroke-[1.75]" />
              <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                Today's Field Detailing Route
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500 font-semibold bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto custom-scrollbar flex-1">
            {schedule.map((item) => (
              <div
                key={item.id}
                className="py-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3 text-sm"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {item.time}
                    </span>
                    <Badge variant={item.specialty} size="xs">
                      {item.specialty}
                    </Badge>
                    <Badge variant={item.status} size="xs" dot>
                      {item.status}
                    </Badge>
                  </div>

                  <h4
                    onClick={() => handleNavigateToDoctor(item.doctorName)}
                    className="text-base font-bold text-slate-900 hover:text-teal-700 transition cursor-pointer"
                  >
                    {item.doctorName}
                  </h4>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {item.hospital}
                  </p>

                  <p className="text-slate-700 mt-1 line-clamp-1 bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                    <strong className="text-slate-800">Objective:</strong> {item.objective}
                  </p>
                </div>

                {/* Quick Status Toggle */}
                <div className="flex flex-col gap-1.5 shrink-0 self-center pl-2">
                  {item.status !== "Completed" ? (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, "Completed")}
                      className="px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-md border border-emerald-200 transition cursor-pointer shadow-2xs"
                    >
                      Done
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-4 h-4" /> Done
                    </span>
                  )}
                  {item.status === "Upcoming" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, "In Progress")}
                      className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md border border-slate-200 transition cursor-pointer shadow-2xs"
                    >
                      In Progress
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signature WHAT CHANGED Timeline */}
        <RecentActivity onViewDetails={(item) => setSelectedActivity(item)} />
      </div>

      {/* SECTION 4: TERRITORY CHANNEL VELOCITY & COVERAGE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 card-shadow p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-teal-600 stroke-[1.75]" />
            <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
              Field Detailing Channel Velocity & Coverage
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 font-semibold px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
            Last 30 Days Territory Summary
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-slate-800">In-Person Clinic Visits</span>
              <span className="text-slate-900 font-bold font-mono">58%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-teal-600 h-full rounded-full" style={{ width: "58%" }} />
            </div>
            <p className="text-xs text-slate-500 font-mono">490 Detailing sessions</p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-slate-800">Hospital Grand Rounds</span>
              <span className="text-slate-900 font-bold font-mono">24%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: "24%" }} />
            </div>
            <p className="text-xs text-slate-500 font-mono">202 Academic exchanges</p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-slate-800">Virtual / Tele-Detailing</span>
              <span className="text-slate-900 font-bold font-mono">18%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "18%" }} />
            </div>
            <p className="text-xs text-slate-500 font-mono">153 Clinical calls</p>
          </div>
        </div>
      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <Modal
          isOpen={!!selectedActivity}
          onClose={() => setSelectedActivity(null)}
          title={`Detailing Log: ${selectedActivity.doctorName}`}
          subtitle={`${selectedActivity.hospital} • ${selectedActivity.date}`}
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={selectedActivity.specialty}>{selectedActivity.specialty}</Badge>
              <Badge variant={selectedActivity.sentiment} dot>
                Sentiment: {selectedActivity.sentiment}
              </Badge>
              <span className="text-slate-600 font-medium text-xs">
                Channel: {selectedActivity.visitType}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono">
                AI Executive Summary
              </h5>
              <p className="text-slate-800 leading-relaxed text-sm">
                {selectedActivity.aiSummary?.summary || selectedActivity.rawNotes}
              </p>
            </div>

            {selectedActivity.aiSummary?.followUpAction && (
              <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-100">
                <h5 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-1 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Recommended Commercial Action
                </h5>
                <p className="text-teal-950 leading-relaxed font-semibold text-sm">
                  {selectedActivity.aiSummary.followUpAction}
                </p>
              </div>
            )}

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
                Products Discussed
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {(selectedActivity.products || []).map((prod, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-800 font-medium text-xs shadow-2xs"
                  >
                    {prod}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setSelectedActivity(null);
                  navigate("/interaction");
                }}
              >
                Log New Detailing for this Doctor
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}