import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Search,
  Users,
  ClipboardList,
  Sparkles,
  Building,
  ArrowRight,
  Command,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { setSelectedHCP } from "../../redux/slices/hcpSlice";
import { PRODUCTS_CATALOG } from "../../constants/mockData";
import HCPAvatar from "./HCPAvatar";

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const hcps = useSelector((state) => state.hcp.items);

  // Filter items
  const matchedHCPs = query.trim()
    ? hcps
        .filter(
          (h) =>
            h.name.toLowerCase().includes(query.toLowerCase()) ||
            h.specialty.toLowerCase().includes(query.toLowerCase()) ||
            h.hospital.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 4)
    : hcps.slice(0, 4);

  const matchedProducts = PRODUCTS_CATALOG.filter(
    (p) =>
      !query.trim() ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.indication.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const actions = [
    {
      id: "act-log",
      title: "Log Field Detailing Interaction",
      category: "Action",
      icon: ClipboardList,
      handler: () => {
        onClose();
        navigate("/interaction");
      },
    },
    {
      id: "act-hcp",
      title: "Explore All Healthcare Professionals",
      category: "Navigation",
      icon: Users,
      handler: () => {
        onClose();
        navigate("/hcp");
      },
    },
    {
      id: "act-ai",
      title: "Launch AI Clinical Analyst Copilot",
      category: "Intelligence",
      icon: Sparkles,
      handler: () => {
        onClose();
        navigate("/chat");
      },
    },
  ];

  // Combined flat list for keyboard indexing
  const allSelectable = [
    ...actions.map((a) => ({ type: "action", data: a })),
    ...matchedHCPs.map((h) => ({ type: "hcp", data: h })),
  ];

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
      if (isOpen && allSelectable.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % allSelectable.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + allSelectable.length) % allSelectable.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          const selected = allSelectable[selectedIndex];
          if (selected) {
            if (selected.type === "action") {
              selected.data.handler();
            } else if (selected.type === "hcp") {
              dispatch(setSelectedHCP(selected.data));
              onClose();
              navigate("/hcp");
            }
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, allSelectable, selectedIndex, dispatch, navigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:pt-24 text-center">
        <div
          className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white text-left align-middle popover-shadow border border-slate-200 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Box */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Type a doctor name, hospital, product, or command..."
              className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-900 placeholder-slate-400"
            />
            <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              ESC
            </span>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-3 custom-scrollbar space-y-4 text-sm">
            {/* Quick Actions */}
            <div>
              <div className="px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Quick Actions
              </div>
              <div className="space-y-1">
                {actions.map((act, idx) => {
                  const Icon = act.icon;
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={act.handler}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition group cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white font-semibold shadow-2xs"
                          : "hover:bg-slate-100/80 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected ? "bg-slate-800 text-teal-400" : "bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className={isSelected ? "text-white font-semibold text-sm" : "text-slate-800 text-sm font-medium"}>
                          {act.title}
                        </span>
                      </div>
                      <ArrowRight className={`w-4 h-4 transition ${
                        isSelected ? "text-teal-400" : "text-slate-400 group-hover:text-teal-600"
                      }`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Doctors */}
            <div>
              <div className="px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Healthcare Professionals
              </div>
              <div className="space-y-1">
                {matchedHCPs.map((doc, docIdx) => {
                  const itemIndex = actions.length + docIdx;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => {
                        dispatch(setSelectedHCP(doc));
                        onClose();
                        navigate("/hcp");
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition group cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white font-semibold shadow-2xs"
                          : "hover:bg-slate-100/80 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <HCPAvatar
                          src={doc.avatar}
                          name={doc.name}
                          size="sm"
                        />
                        <div className="truncate">
                          <p className={`font-bold truncate text-sm ${isSelected ? "text-white" : "text-slate-900 group-hover:text-teal-800"}`}>
                            {doc.name}
                          </p>
                          <p className={`text-xs truncate ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                            {doc.specialty} • {doc.hospital}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-mono font-semibold transition shrink-0 ${
                        isSelected ? "text-teal-300" : "text-slate-400 group-hover:text-teal-600"
                      }`}>
                        View 360° →
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Products */}
            {matchedProducts.length > 0 && (
              <div>
                <div className="px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Pharma Products Catalog
                </div>
                <div className="space-y-1">
                  {matchedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.indication}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                        {p.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400">
            <span>Use <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">↑</kbd> <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">↓</kbd> to navigate, <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">Enter</kbd> to select</span>
            <span className="font-mono text-xs font-medium">OmniHealth OS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

