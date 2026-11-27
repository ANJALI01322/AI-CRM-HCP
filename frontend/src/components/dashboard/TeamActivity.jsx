import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { errorMessage, getTeamActivity } from "../../services/crmApi";
import { relativeDays } from "../../utils/format";

const daysSince = (iso) =>
  iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)) : null;

/** Manager-only: per-person activity for the whole organization. */
export default function TeamActivity() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getTeamActivity()
      .then((data) => !cancelled && setRows(data))
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 card-shadow p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Users className="w-5 h-5 text-teal-600 stroke-[1.75]" />
          <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">Team Activity</h3>
        </div>
        <span className="text-xs font-mono text-slate-500 font-semibold px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
          Per rep
        </span>
      </div>

      {error ? (
        <p role="alert" className="text-xs text-rose-700 py-4 text-center">
          Could not load team activity: {error}
        </p>
      ) : rows === null ? (
        <p className="text-xs text-slate-400 py-4 text-center">Loading team activity…</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 text-center">No team members yet.</p>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-2.5 pr-4">Team member</th>
                <th className="py-2.5 px-4 text-right">HCPs</th>
                <th className="py-2.5 px-4 text-right">Interactions (30d)</th>
                <th className="py-2.5 px-4 text-right">Total</th>
                <th className="py-2.5 px-4 text-right">Overdue</th>
                <th className="py-2.5 pl-4">Last activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.userId}>
                  <td className="py-3 pr-4">
                    <span className="font-semibold text-slate-900">{r.fullName}</span>{" "}
                    <span className="text-xs text-slate-400 font-mono">{r.role}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">{r.assignedHcps}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">{r.interactionsLast30Days}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">{r.interactionsTotal}</td>
                  <td
                    className={`py-3 px-4 text-right font-mono tabular-nums ${
                      r.overdueFollowUps > 0 ? "text-rose-700 font-bold" : ""
                    }`}
                  >
                    {r.overdueFollowUps}
                  </td>
                  <td className="py-3 pl-4 text-xs text-slate-500 whitespace-nowrap">
                    {r.lastActivity ? relativeDays(daysSince(r.lastActivity)) : "No activity"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
