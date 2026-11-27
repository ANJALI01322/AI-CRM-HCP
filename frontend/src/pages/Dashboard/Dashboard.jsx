import React, { useState } from "react";
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
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { fetchDashboardStats } from "../../redux/slices/dashboardSlice";
import { setSelectedHCP } from "../../redux/slices/hcpSlice";
import { updateActiveDraft } from "../../redux/slices/interactionSlice";
import { updateFollowUp, errorMessage } from "../../services/crmApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import { Skeleton } from "../../components/common/Skeleton";
import ClinicalSignalCard from "../../components/common/ClinicalSignalCard";
import RecentActivity from "../../components/dashboard/RecentActivity";
import { dueLabel, pluralize, shortDate } from "../../utils/format";
import toast from "react-hot-toast";

const HEALTH_SEGMENTS = [
  { key: "strong", label: "Strong", color: "bg-emerald-500" },
  { key: "healthy", label: "Healthy", color: "bg-teal-500" },
  { key: "watch", label: "Watch", color: "bg-amber-500" },
  { key: "atRisk", label: "At Risk", color: "bg-rose-500" },
];

const CHANNEL_COLORS = ["bg-teal-600", "bg-indigo-600", "bg-emerald-500", "bg-sky-500", "bg-amber-500"];

const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { stats, status, error } = useSelector((state) => state.dashboard);
  const hcps = useSelector((state) => state.hcp.items);
  const user = useSelector((state) => state.auth.user);

  const [selectedActivity, setSelectedActivity] = useState(null);

  const openHCP = (hcpId) => {
    const doctor = hcps.find((h) => h.id === hcpId);
    if (doctor) dispatch(setSelectedHCP(doctor));
    navigate("/hcp");
  };

  const logForHCP = (hcpId) => {
    const doctor = hcps.find((h) => h.id === hcpId);
    if (doctor) {
      dispatch(
        updateActiveDraft({
          doctorName: doctor.name,
          hospital: doctor.hospital,
          specialty: doctor.specialty,
          products: doctor.productsOfInterest || [],
        })
      );
    }
    navigate("/interaction");
  };

  const markDone = async (followUp) => {
    try {
      await updateFollowUp(followUp.id, { status: "done" });
      toast.success("Follow-up marked done");
      dispatch(fetchDashboardStats());
    } catch (err) {
      toast.error(`Could not update follow-up: ${errorMessage(err)}`);
    }
  };

  if (!stats) {
    if (status === "failed") {
      return (
        <EmptyState
          title="Could not load the dashboard"
          description={error || "The server could not be reached."}
          actionLabel="Retry"
          onAction={() => dispatch(fetchDashboardStats())}
        />
      );
    }
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const { health, followUps, coverageLast30Days, nextBestActions, channelSplit, dueFollowUps } = stats;
  const topAction = nextBestActions[0];
  const isManager = user?.role === "manager";
  const scopeLabel = isManager ? "organization" : "assigned";

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Command & Breadcrumb Header */}
      <PageHeader
        title="Clinical Intelligence Command Center"
        subtitle={`Territory relationship health, next best actions and follow-ups across your ${scopeLabel} HCPs.`}
        badge={`Live • ${shortDate(stats.today)}`}
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
              HCP Intelligence ({stats.hcpCount})
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

      {/* HERO OPERATIONAL SURFACE */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-7 sm:p-9 border border-slate-800/90 shadow-2xl relative overflow-hidden">
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
              {stats.hcpCount === 0
                ? "No HCPs yet. Add your first doctor to start tracking relationships."
                : followUps.dueNow > 0
                ? `${pluralize(followUps.dueNow, "follow-up")} due or overdue. ${
                    topAction ? `Top priority: ${topAction.name} — ${topAction.reason}` : ""
                  }`
                : topAction
                ? `Top priority: ${topAction.name} — ${topAction.reason}`
                : "No urgent actions right now. Every HCP has recent contact and nothing is overdue."}
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

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3.5 shrink-0 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-8 lg:min-w-[240px]">
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase font-semibold">
                <span>Avg Relationship Health</span>
              </div>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                {health.averageScore === null ? "—" : `${health.averageScore}/100`}
              </p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-teal-400 h-full rounded-full" style={{ width: `${health.averageScore || 0}%` }} />
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase font-semibold">
                <span>Field Coverage</span>
                <span className="text-slate-300">Last 30 days</span>
              </div>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                {stats.hcpCount ? `${coverageLast30Days.pct}%` : "—"}
              </p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-sky-400 h-full rounded-full" style={{ width: `${coverageLast30Days.pct}%` }} />
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase font-semibold">
                <span>Key Opinion Leaders</span>
                <span className="text-emerald-400">KOL / Tier 1</span>
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {pluralize(stats.kolCount, "Doctor")}
              </p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${pct(stats.kolCount, stats.hcpCount)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TERRITORY RELATIONSHIP HEALTH DISTRIBUTION BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 card-shadow p-5 sm:p-6 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600 stroke-[2.2]" />
              Territory Relationship Health Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Distribution of {pluralize(stats.hcpCount, "healthcare professional")} by recency of contact and latest sentiment
            </p>
          </div>
          {health.averageScore !== null && (
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
              Average health: {health.averageScore}/100
            </span>
          )}
        </div>

        {stats.hcpCount === 0 ? (
          <p className="text-xs text-slate-400 py-2">No HCPs to measure yet.</p>
        ) : (
          <>
            <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden gap-0.5 p-0.5">
              {HEALTH_SEGMENTS.filter((seg) => health[seg.key] > 0).map((seg) => (
                <div
                  key={seg.key}
                  className={`${seg.color} h-full first:rounded-l-full last:rounded-r-full transition-all duration-500`}
                  style={{ width: `${pct(health[seg.key], stats.hcpCount)}%` }}
                  title={`${seg.label}: ${pluralize(health[seg.key], "doctor")} (${pct(health[seg.key], stats.hcpCount)}%)`}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
              {HEALTH_SEGMENTS.map((seg) => (
                <div key={seg.key} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${seg.color} shrink-0`} />
                  <span className="text-slate-600 font-medium">
                    {seg.label}: <strong>{pluralize(health[seg.key], "Doctor")}</strong> ({pct(health[seg.key], stats.hcpCount)}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* METRIC STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 border-t-4 border-t-teal-500 card-shadow hover:card-shadow-hover transition-all duration-200 flex flex-col justify-between cursor-pointer" onClick={() => navigate("/hcp")}>
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <span>Registered HCPs</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">{stats.hcpCount}</span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <span>{stats.highPriorityCount} high priority</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 mt-2 block font-medium">{pluralize(stats.kolCount, "Key Opinion Leader")}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 border-t-4 border-t-sky-500 card-shadow hover:card-shadow-hover transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <span>Today's Visits Logged</span>
            <CalendarCheck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">{stats.todayVisits}</span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-sky-700 font-semibold">
              <span>{shortDate(stats.today)}</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 mt-2 block font-medium">
            {pluralize(coverageLast30Days.touched, "HCP")} contacted in the last 30 days
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 border-t-4 border-t-indigo-500 card-shadow hover:card-shadow-hover transition-all duration-200 flex flex-col justify-between cursor-pointer" onClick={() => navigate("/interaction")}>
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <span>Detailing Sessions</span>
            <ClipboardList className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">{stats.interactionsTotal}</span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-indigo-700 font-semibold">
              <span>{stats.interactionsLast30Days} in the last 30 days</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 mt-2 block font-medium">All logged interactions</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 border-t-4 border-t-amber-500 card-shadow hover:card-shadow-hover transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <span>Follow-ups Due</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold font-mono text-amber-700 tabular-nums">{followUps.dueNow}</span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-800 font-semibold">
              <span>{followUps.overdue} overdue • {followUps.dueToday} due today</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 mt-2 block font-medium">
            {followUps.open} open • {followUps.dueThisWeek} due in the next 7 days
          </span>
        </div>
      </div>

      {/* NEXT BEST ACTIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-teal-600 shadow-xs" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              NEXT BEST ACTIONS <span className="text-xs font-mono text-slate-400 font-semibold">OPERATING QUEUE</span>
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono font-semibold hidden sm:inline">
            Ranked by days since visit, sentiment and overdue follow-ups
          </span>
        </div>

        {nextBestActions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {nextBestActions.map((item, idx) => (
              <ClinicalSignalCard
                key={item.hcpId}
                index={String(idx + 1).padStart(2, "0")}
                type={item.type}
                doctor={{ name: item.name, specialty: item.specialty, hospital: item.hospital }}
                why={item.reason}
                aiReasoning={item.action}
                actionLabel={item.type === "followup" ? "Open & Log Visit" : "Log Visit"}
                onAction={() => logForHCP(item.hcpId)}
                onViewHCP={() => openHCP(item.hcpId)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CheckCircle2}
            title={stats.hcpCount === 0 ? "No HCPs yet" : "Nothing needs attention"}
            description={
              stats.hcpCount === 0
                ? "Add a doctor to start building your territory plan."
                : "Every HCP has been contacted recently and no follow-ups are overdue."
            }
          />
        )}
      </div>

      {/* FOLLOW-UPS DUE & TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 card-shadow p-5 sm:p-6 flex flex-col h-full text-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <CalendarCheck className="w-5 h-5 text-teal-600 stroke-[1.75]" />
              <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                Follow-ups Due
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500 font-semibold bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              {shortDate(stats.today)}
            </span>
          </div>

          {dueFollowUps.length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto custom-scrollbar flex-1">
              {dueFollowUps.map((item) => (
                <div
                  key={item.id}
                  className="py-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3 text-sm"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={item.specialty} size="xs">
                        {item.specialty}
                      </Badge>
                      <Badge variant={item.daysOverdue > 0 ? "At Risk" : "Watch"} size="xs" dot>
                        {dueLabel(item.daysOverdue, item.dueDate, stats.today)}
                      </Badge>
                    </div>

                    <h4
                      onClick={() => openHCP(item.hcpId)}
                      className="text-base font-bold text-slate-900 hover:text-teal-700 transition cursor-pointer"
                    >
                      {item.hcp}
                    </h4>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {item.hospital}
                    </p>

                    <p className="text-slate-700 mt-1 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                      <strong className="text-slate-800">Action:</strong> {item.action}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0 self-center pl-2">
                    <button
                      type="button"
                      onClick={() => markDone(item)}
                      className="px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-md border border-emerald-200 transition cursor-pointer shadow-2xs"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-xs text-slate-400 gap-2">
              <CheckCircle2 className="w-6 h-6 text-slate-300" />
              No follow-ups due. You're all caught up.
            </div>
          )}
        </div>

        <RecentActivity onViewDetails={(item) => setSelectedActivity(item)} />
      </div>

      {/* CHANNEL SPLIT */}
      <div className="bg-white rounded-2xl border border-slate-200/90 card-shadow p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-teal-600 stroke-[1.75]" />
            <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
              Field Detailing Channel Mix
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 font-semibold px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
            Last 30 Days
          </span>
        </div>

        {channelSplit.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {channelSplit.map((ch, idx) => (
              <div key={ch.channel} className="space-y-2 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-800">{ch.channel}</span>
                  <span className="text-slate-900 font-bold font-mono">{ch.pct}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className={`${CHANNEL_COLORS[idx % CHANNEL_COLORS.length]} h-full rounded-full`} style={{ width: `${ch.pct}%` }} />
                </div>
                <p className="text-xs text-slate-500 font-mono">{pluralize(ch.count, "interaction")}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            No interactions logged in the last 30 days.
          </p>
        )}
      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <Modal
          isOpen={!!selectedActivity}
          onClose={() => setSelectedActivity(null)}
          title={`Detailing Log: ${selectedActivity.doctorName}`}
          subtitle={`${selectedActivity.hospital} • ${selectedActivity.date}`}
          footer={
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                logForHCP(selectedActivity.hcpId);
                setSelectedActivity(null);
              }}
            >
              Log New Detailing for this Doctor
            </Button>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              {selectedActivity.specialty && <Badge variant={selectedActivity.specialty}>{selectedActivity.specialty}</Badge>}
              {selectedActivity.sentiment && (
                <Badge variant={selectedActivity.sentiment} dot>
                  Sentiment: {selectedActivity.sentiment}
                </Badge>
              )}
              <span className="text-slate-600 font-medium text-xs">
                Channel: {selectedActivity.visitType}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono">
                Summary
              </h5>
              <p className="text-slate-800 leading-relaxed text-sm">
                {selectedActivity.aiSummary?.summary || selectedActivity.rawNotes}
              </p>
            </div>

            {selectedActivity.aiSummary?.followUpAction && (
              <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-100">
                <h5 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-1 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Follow-up Action
                </h5>
                <p className="text-teal-950 leading-relaxed font-semibold text-sm">
                  {selectedActivity.aiSummary.followUpAction}
                </p>
              </div>
            )}

            {(selectedActivity.products || []).length > 0 && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
                  Products Discussed
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedActivity.products.map((prod, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-800 font-medium text-xs shadow-2xs"
                    >
                      {prod}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
