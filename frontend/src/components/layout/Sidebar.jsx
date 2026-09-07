import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Sparkles,
  Activity,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
  Radio,
  X,
} from "lucide-react";
import {
  toggleSidebarCollapse,
  setMobileSidebarOpen,
} from "../../redux/slices/uiSlice";

const navigationGroups = [
  {
    group: "COMMAND",
    items: [
      {
        name: "Territory Overview",
        path: "/",
        icon: LayoutDashboard,
        badge: null,
      },
    ],
  },
  {
    group: "RELATIONSHIPS",
    items: [
      {
        name: "HCP Intelligence",
        path: "/hcp",
        icon: Users,
        badgeKey: "hcpsCount",
      },
      {
        name: "Detailing Logger",
        path: "/interaction",
        icon: ClipboardList,
        badge: "AI Active",
        badgeVariant: "ai",
      },
    ],
  },
  {
    group: "INTELLIGENCE",
    items: [
      {
        name: "AI Analyst Workspace",
        path: "/chat",
        icon: Sparkles,
        badge: "Live",
        badgeVariant: "live",
      },
    ],
  },
];

import HCPAvatar from "../common/HCPAvatar";

export default function Sidebar() {
  const dispatch = useDispatch();
  const { isSidebarCollapsed, isMobileSidebarOpen } = useSelector(
    (state) => state.ui
  );
  const hcps = useSelector((state) => state.hcp.items);
  const schedule = useSelector((state) => state.dashboard.schedule);

  const pendingVisitsCount = schedule.filter(
    (s) => s.status !== "Completed"
  ).length;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300 select-none border-r border-slate-800/80 text-sm">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-xs shrink-0">
            <Activity className="w-4 h-4 stroke-[2.2]" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-sm text-white tracking-tight flex items-center gap-2">
                OMNIHEALTH
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-950/90 text-teal-300 border border-teal-800">
                  CLINICAL OS
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => dispatch(setMobileSidebarOpen(false))}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">
        {navigationGroups.map((groupSection, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isSidebarCollapsed && (
              <p className="px-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
                {groupSection.group}
              </p>
            )}

            <nav className="space-y-1">
              {groupSection.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => dispatch(setMobileSidebarOpen(false))}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group relative ${
                        isActive
                          ? "bg-slate-900 text-white shadow-xs border border-slate-800"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Left active indicator pill */}
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-teal-400" />
                        )}

                        <Icon className={`w-4 h-4 shrink-0 stroke-[2] ${isActive ? "text-teal-400" : "text-slate-400 group-hover:text-slate-200"}`} />

                        {!isSidebarCollapsed && (
                          <span className="truncate flex-1">{item.name}</span>
                        )}

                        {!isSidebarCollapsed && item.badgeKey === "hcpsCount" && (
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
                            {hcps.length}
                          </span>
                        )}

                        {!isSidebarCollapsed && item.badge && (
                          <span
                            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                              item.badgeVariant === "live"
                                ? "bg-teal-950 text-teal-300 border border-teal-800/80"
                                : "bg-slate-800 text-slate-300 border border-slate-700/80"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Territory Target Velocity Ribbon */}
        {!isSidebarCollapsed && (
          <div className="pt-2">
            <p className="px-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
              Territory Pulse
            </p>
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80 space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" /> Field Schedule
                </span>
                <span className="font-mono font-bold text-slate-200">
                  {pendingVisitsCount} Pending
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all"
                  style={{ width: "75%" }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Coverage: 74%</span>
                <span className="text-teal-400 font-bold">↑ 12% Q3</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Representative Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900 transition">
          <HCPAvatar
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            name="Anjali Rao"
            size="sm"
            showStatus
            statusColor="bg-teal-400"
          />

          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-bold text-slate-200 truncate flex items-center gap-1">
                Anjali Rao
              </span>
              <span className="text-xs text-slate-400 truncate font-mono">
                Territory Rep • Delhi NCR
              </span>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => dispatch(toggleSidebarCollapse())}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition shrink-0 cursor-pointer"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-200 z-30 ${
          isSidebarCollapsed ? "w-18" : "w-60"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => dispatch(setMobileSidebarOpen(false))}
          />
          <div className="fixed inset-y-0 left-0 w-64 max-w-[80vw] shadow-2xl z-10 animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}