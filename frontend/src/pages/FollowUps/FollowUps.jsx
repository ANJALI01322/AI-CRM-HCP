import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CalendarClock, CheckCircle2, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import { Skeleton } from "../../components/common/Skeleton";
import { errorMessage, listFollowUps, updateFollowUp } from "../../services/crmApi";
import { fetchDashboardStats } from "../../redux/slices/dashboardSlice";
import { setSelectedHCP } from "../../redux/slices/hcpSlice";
import { dueLabel, pluralize } from "../../utils/format";

const localToday = () => new Date().toLocaleDateString("en-CA");

const TABS = [
  { id: "all", label: "All open" },
  { id: "overdue", label: "Overdue" },
  { id: "today", label: "Due today" },
  { id: "upcoming", label: "Upcoming" },
];

const daysOverdue = (dueDate, today) =>
  Math.max(0, Math.round((new Date(`${today}T00:00:00`) - new Date(`${dueDate}T00:00:00`)) / 86400000));

export default function FollowUps() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hcps = useSelector((state) => state.hcp.items);

  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("all");
  const [rescheduling, setRescheduling] = useState(null); // { id, date }
  const [busyId, setBusyId] = useState(null);
  const today = localToday();

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems(await listFollowUps("open"));
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const change = async (id, patch, successMessage) => {
    setBusyId(id);
    try {
      await updateFollowUp(id, patch);
      toast.success(successMessage);
      setRescheduling(null);
      await load();
      dispatch(fetchDashboardStats());
    } catch (err) {
      toast.error(`Could not update follow-up: ${errorMessage(err)}`);
    } finally {
      setBusyId(null);
    }
  };

  const openHCP = (hcpId) => {
    const doctor = hcps.find((h) => h.id === hcpId);
    if (doctor) dispatch(setSelectedHCP(doctor));
    navigate("/hcp");
  };

  const bucket = (f) => (f.dueDate < today ? "overdue" : f.dueDate === today ? "today" : "upcoming");
  const counts = { all: items?.length || 0, overdue: 0, today: 0, upcoming: 0 };
  (items || []).forEach((f) => (counts[bucket(f)] += 1));
  const visible = (items || []).filter((f) => tab === "all" || bucket(f) === tab);

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Follow-ups"
        subtitle="Open commitments from your detailing visits. Complete them or move the date."
        badge={items ? `${pluralize(counts.overdue, "overdue item")}` : undefined}
        breadcrumbs={[{ label: "OmniHealth OS", path: "/" }, { label: "Follow-ups" }]}
      />

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 text-sm overflow-x-auto custom-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer shrink-0 ${
              tab === t.id
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/90"
            }`}
          >
            {t.label} ({counts[t.id]})
          </button>
        ))}
      </div>

      {items === null && !error ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 card-shadow p-5 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Could not load follow-ups"
          description={error}
          actionLabel="Retry"
          onAction={load}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={items.length === 0 ? "No open follow-ups" : "Nothing in this view"}
          description={
            items.length === 0
              ? "Follow-ups are created when you log a visit with a follow-up date."
              : "Switch tabs to see other open follow-ups."
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 card-shadow divide-y divide-slate-100">
          {visible.map((f) => {
            const overdue = daysOverdue(f.dueDate, today);
            const isRescheduling = rescheduling?.id === f.id;
            return (
              <div key={f.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      onClick={() => openHCP(f.hcpId)}
                      className="text-base font-bold text-slate-900 hover:text-teal-700 transition cursor-pointer"
                    >
                      {f.hcpName}
                    </h4>
                    <Badge variant={overdue > 0 ? "At Risk" : f.dueDate === today ? "Watch" : "Healthy"} size="xs" dot>
                      {dueLabel(overdue, f.dueDate, today)}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {f.hcpHospital}
                  </p>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs sm:text-sm">
                    {f.action}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">Due {f.dueDate}</p>
                </div>

                <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
                  {isRescheduling ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="date"
                        min={today}
                        value={rescheduling.date}
                        onChange={(e) => setRescheduling({ id: f.id, date: e.target.value })}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        aria-label="New due date"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!rescheduling.date || busyId === f.id}
                        onClick={() => change(f.id, { dueDate: rescheduling.date }, "Follow-up rescheduled")}
                      >
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setRescheduling(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={CalendarClock}
                        disabled={busyId === f.id}
                        onClick={() => setRescheduling({ id: f.id, date: f.dueDate < today ? today : f.dueDate })}
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CheckCircle2}
                        isLoading={busyId === f.id}
                        onClick={() => change(f.id, { status: "done" }, "Follow-up marked done")}
                      >
                        Done
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
