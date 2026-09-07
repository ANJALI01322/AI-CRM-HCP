import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  Plus,
  CheckCircle2,
  AlertCircle,
  Command,
  MapPin,
  Clock,
  Radio,
  X,
  ExternalLink,
} from "lucide-react";
import {
  toggleMobileSidebar,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../redux/slices/uiSlice";
import Button from "../common/Button";
import HCPAvatar from "../common/HCPAvatar";
import CommandPalette from "../common/CommandPalette";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState("all"); // 'all' | 'unread' | 'alerts'
  const notifRef = useRef(null);

  const notifications = useSelector((state) => state.ui.notifications);
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Click outside to close notification panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotifOpen]);

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === "unread") return !n.read;
    if (notifFilter === "alerts") return n.type === "alert";
    return true;
  });

  const handleNotificationClick = (notif) => {
    dispatch(markNotificationAsRead(notif.id));
    setIsNotifOpen(false);
    if (notif.title.includes("Follow-up") || notif.title.includes("Rahul Sharma")) {
      navigate("/hcp");
    } else if (notif.type === "ai") {
      navigate("/chat");
    } else {
      navigate("/hcp");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        {/* Main Bar */}
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Mobile Menu & Global Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button
              type="button"
              onClick={() => dispatch(toggleMobileSidebar())}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar (opens Command Palette) */}
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="w-full flex items-center justify-between gap-2.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 rounded-xl px-3.5 py-2 transition text-left cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 transition" />
                <span className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-700 truncate font-medium">
                  Search doctors, organizations, products, signals...
                </span>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                <Command className="w-3 h-3" />K
              </span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* AI Intelligence Engine Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-mono font-semibold text-slate-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Groq Intelligence</span>
              <span className="text-slate-400 font-normal">• Live</span>
            </div>

            {/* Quick Log Action */}
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate("/interaction")}
              className="hidden sm:inline-flex shadow-2xs font-semibold cursor-pointer"
            >
              Log Detailing
            </Button>

            {/* Notifications Center */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition relative focus:outline-none cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 stroke-[2]" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl popover-shadow border border-slate-200/90 p-2.5 z-50 animate-fade-in text-xs sm:text-sm">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        Operational Alerts
                      </span>
                      {unreadNotifsCount > 0 && (
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                          {unreadNotifsCount} New
                        </span>
                      )}
                    </div>
                    {unreadNotifsCount > 0 && (
                      <button
                        type="button"
                        onClick={() => dispatch(markAllNotificationsAsRead())}
                        className="text-[11px] text-teal-700 hover:text-teal-800 font-medium cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Filter Pills inside Notification Panel */}
                  <div className="flex items-center gap-1 px-2.5 py-1.5 border-b border-slate-100 bg-slate-50/60 text-[10px]">
                    {[
                      { id: "all", label: "All" },
                      { id: "unread", label: `Unread (${unreadNotifsCount})` },
                      { id: "alerts", label: "Urgent Alerts" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setNotifFilter(tab.id)}
                        className={`px-2 py-0.5 rounded transition cursor-pointer font-medium ${
                          notifFilter === tab.id
                            ? "bg-white text-slate-900 shadow-2xs font-semibold"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto custom-scrollbar mt-1">
                    {filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-2.5 rounded-lg transition cursor-pointer flex gap-2.5 items-start ${
                            notif.read
                              ? "opacity-70 hover:bg-slate-50"
                              : "bg-slate-50/80 hover:bg-slate-100/80"
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {notif.type === "alert" ? (
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                            ) : notif.type === "ai" ? (
                              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 leading-snug flex items-center justify-between">
                              <span className="truncate">{notif.title}</span>
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 ml-1.5" />
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                              {notif.description}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400 mt-1 inline-block">
                              {notif.time}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No notifications in this filter.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Rep Profile Avatar */}
            <div className="flex items-center pl-1 border-l border-slate-200">
              <HCPAvatar
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                name="Anjali Rao"
                size="xs"
                showStatus
                statusColor="bg-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Global Context Bar */}
        <div className="bg-slate-50/90 border-t border-slate-200/70 px-4 sm:px-6 py-1.5 flex items-center justify-between text-[11px] text-slate-500 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 font-medium shrink-0">
            <span className="flex items-center gap-1 text-slate-900 font-semibold">
              <MapPin className="w-3 h-3 text-teal-600" /> Delhi NCR
            </span>
            <span className="text-slate-300">/</span>
            <span>Territory Field Ops</span>
            <span className="text-slate-300">/</span>
            <span className="font-mono text-slate-600">Q3 2026 • Week 37</span>
          </div>

          <div className="flex items-center gap-3 shrink-0 font-mono text-[10px]">
            <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-semibold">
              3 Actions Required Today
            </span>
            <span className="text-slate-400 hidden sm:inline">
              Sync: Live (Local Store)
            </span>
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </>
  );
}