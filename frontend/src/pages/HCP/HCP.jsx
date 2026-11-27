import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Download,
  RotateCcw,
  Sparkles,
  Filter,
  ShieldCheck,
} from "lucide-react";
import {
  setSearchQuery,
  setFilterSpecialty,
  setFilterPriority,
  setFilterStatus,
  setFilterHospital,
  setViewMode,
  resetFilters,
  setSelectedHCP,
  deleteHCP,
  fetchHCPs,
} from "../../redux/slices/hcpSlice";
import { updateActiveDraft } from "../../redux/slices/interactionSlice";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import { Skeleton } from "../../components/common/Skeleton";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import HCPTable from "../../components/hcp/HCPTable";
import HCPCard from "../../components/hcp/HCPCard";
import HCPDetailDrawer from "../../components/hcp/HCPDetailDrawer";
import AddHCPModal from "../../components/hcp/AddHCPModal";
import EditHCPModal from "../../components/hcp/EditHCPModal";
import { SPECIALTIES } from "../../constants/options";
import { downloadCsv } from "../../services/crmApi";
import toast from "react-hot-toast";

export default function HCP() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    items: hcps,
    status: hcpStatus,
    error: hcpError,
    selectedHCP,
    searchQuery,
    filterSpecialty,
    filterPriority,
    filterStatus,
    filterHospital,
    viewMode,
  } = useSelector((state) => state.hcp);

  const [savedView, setSavedView] = useState("all"); // 'all' | 'kol' | 'watch' | 'cardio'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHCP, setEditingHCP] = useState(null);
  const [deletingHCP, setDeletingHCP] = useState(null);

  // Filter options come from the user's own HCPs (plus the standard specialty list).
  const specialtyOptions = [...new Set([...SPECIALTIES, ...hcps.map((h) => h.specialty)])].sort();
  const hospitalOptions = [...new Set(hcps.map((h) => h.hospital))].sort();

  // Filter and Search Logic
  const filteredHCPs = hcps.filter((doctor) => {
    const matchesSearch =
      !searchQuery.trim() ||
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doctor.qualification &&
        doctor.qualification.toLowerCase().includes(searchQuery.toLowerCase()));

    // Saved View Preset Filters
    if (savedView === "kol" && doctor.tier !== "Tier 1" && doctor.priority !== "High") {
      return false;
    }
    if (savedView === "watch" && doctor.status !== "Follow-up") {
      return false;
    }
    if (savedView === "cardio" && doctor.specialty !== "Cardiology") {
      return false;
    }

    const matchesSpecialty =
      filterSpecialty === "All" || doctor.specialty === filterSpecialty;

    const matchesPriority =
      filterPriority === "All" || doctor.priority === filterPriority;

    const matchesStatus =
      filterStatus === "All" || doctor.status === filterStatus;

    const matchesHospital =
      filterHospital === "All" || doctor.hospital === filterHospital;

    return (
      matchesSearch &&
      matchesSpecialty &&
      matchesPriority &&
      matchesStatus &&
      matchesHospital
    );
  });

  const handleLogInteraction = (doctor) => {
    dispatch(
      updateActiveDraft({
        doctorName: doctor.name,
        hospital: doctor.hospital,
        specialty: doctor.specialty,
        products: doctor.productsOfInterest || [],
      })
    );
    navigate("/interaction");
  };

  const handleOpenEdit = (doctor) => {
    setEditingHCP(doctor);
    setIsEditModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingHCP) {
      const doctor = deletingHCP;
      setDeletingHCP(null);
      try {
        await dispatch(deleteHCP(doctor.id)).unwrap();
        toast.success(`${doctor.name} has been removed.`);
      } catch (err) {
        toast.error(`Could not remove ${doctor.name}: ${err}`);
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const filename = await downloadCsv("/export/hcps.csv");
      toast.success(`Exported ${filename}`);
    } catch (err) {
      toast.error(`Export failed: ${err?.message || "Request failed"}`);
    }
  };

  const hasActiveFilters =
    searchQuery ||
    filterSpecialty !== "All" ||
    filterPriority !== "All" ||
    filterStatus !== "All" ||
    filterHospital !== "All";

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <PageHeader
        title="HCP Intelligence"
        subtitle="Clinical directory, relationship health tracking, and recent engagement."
        badge={`${hcps.length} Doctors Under Management`}
        breadcrumbs={[{ label: "OmniHealth OS", path: "/" }, { label: "HCP Intelligence" }]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Doctor
            </Button>
          </>
        }
      />

      {/* OPERATIONAL SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 border-t-2 border-t-teal-500 card-shadow hover:card-shadow-hover transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Total HCPs
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              Live Registry
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
              {hcps.length}
            </span>
            <span className="text-xs text-slate-500 font-mono font-medium">Territory Active</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-teal-500 h-full rounded-full w-full" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 border-t-2 border-t-sky-500 card-shadow hover:card-shadow-hover transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-700">
              Tier 1 KOLs
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold border border-sky-100">
              Top Impact
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-sky-800 tabular-nums">
              {hcps.filter((h) => h.tier === "Tier 1" || h.tier === "KOL").length}
            </span>
            <span className="text-xs text-emerald-700 font-mono font-semibold">High Influence</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-sky-500 h-full rounded-full"
              style={{
                width: `${Math.round(
                  (hcps.filter((h) => h.tier === "Tier 1" || h.tier === "KOL").length /
                    Math.max(hcps.length, 1)) *
                    100
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 border-t-2 border-t-amber-500 card-shadow hover:card-shadow-hover transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700">
              Relationship Watchlist
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
              Action Due
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-700 tabular-nums">
              {hcps.filter((h) => h.status === "Follow-up").length}
            </span>
            <span className="text-xs text-amber-800 font-mono font-semibold">Follow-up Due</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{
                width: `${Math.round(
                  (hcps.filter((h) => h.status === "Follow-up").length /
                    Math.max(hcps.length, 1)) *
                    100
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 border-t-2 border-t-indigo-500 card-shadow hover:card-shadow-hover transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700">
              Active Opportunities
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
              High Pipeline
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-700 tabular-nums">
              {hcps.filter((h) => h.priority === "High").length}
            </span>
            <span className="text-xs text-teal-700 font-mono font-semibold">In Pipeline</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-indigo-500 h-full rounded-full"
              style={{
                width: `${Math.round(
                  (hcps.filter((h) => h.priority === "High").length /
                    Math.max(hcps.length, 1)) *
                    100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* SAVED VIEWS TABS STRIP */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 text-sm overflow-x-auto custom-scrollbar">
        {[
          { id: "all", label: `All Prescribers (${hcps.length})` },
          { id: "kol", label: `Tier 1 KOLs (${hcps.filter(h => h.tier === "Tier 1" || h.tier === "KOL").length})` },
          { id: "watch", label: `Relationship Watchlist (${hcps.filter(h => h.status === "Follow-up").length})` },
          { id: "cardio", label: `Cardiology (${hcps.filter(h => h.specialty === "Cardiology").length})` },
        ].map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => setSavedView(view.id)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer shrink-0 ${
              savedView === view.id
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/90"
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 card-shadow space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by doctor name, specialty, hospital, city..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-2xs placeholder:text-slate-400"
            />
          </div>

          {/* View Toggles & Clear */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                icon={RotateCcw}
                onClick={() => dispatch(resetFilters())}
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                Reset Filters
              </Button>
            )}

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => dispatch(setViewMode("table"))}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Matrix View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => dispatch(setViewMode("grid"))}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-sm">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Specialty
            </label>
            <select
              value={filterSpecialty}
              onChange={(e) => dispatch(setFilterSpecialty(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs"
            >
              <option value="All">All Specialties</option>
              {specialtyOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Priority Tier
            </label>
            <select
              value={filterPriority}
              onChange={(e) => dispatch(setFilterPriority(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Relationship Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => dispatch(setFilterStatus(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Prescribing</option>
              <option value="Follow-up">Follow-up Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Hospital Account
            </label>
            <select
              value={filterHospital}
              onChange={(e) => dispatch(setFilterHospital(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 truncate shadow-2xs"
            >
              <option value="All">All Hospitals</option>
              {hospitalOptions.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Listing View */}
      {hcps.length === 0 && (hcpStatus === "idle" || hcpStatus === "loading") ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 card-shadow p-5 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : hcps.length === 0 && hcpStatus === "failed" ? (
        <EmptyState
          title="Could not load Healthcare Professionals"
          description={hcpError || "The server could not be reached."}
          actionLabel="Retry"
          onAction={() => dispatch(fetchHCPs())}
        />
      ) : filteredHCPs.length > 0 ? (
        viewMode === "table" ? (
          <HCPTable
            hcps={filteredHCPs}
            onViewDetails={(doctor) => dispatch(setSelectedHCP(doctor))}
            onLogInteraction={handleLogInteraction}
            onEdit={handleOpenEdit}
            onDelete={(doctor) => setDeletingHCP(doctor)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHCPs.map((doctor) => (
              <HCPCard
                key={doctor.id}
                doctor={doctor}
                onViewDetails={(doc) => dispatch(setSelectedHCP(doc))}
                onLogInteraction={handleLogInteraction}
                onEdit={handleOpenEdit}
                onDelete={(doc) => setDeletingHCP(doc)}
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          title="No Healthcare Professionals Found"
          description={
            hasActiveFilters
              ? "Try adjusting your search query or reset your specialty and priority filters."
              : "No doctors have been registered in this territory yet."
          }
          actionLabel="Add New Doctor"
          onAction={() => setIsAddModalOpen(true)}
        />
      )}

      {/* 360° Intelligence Workspace Drawer */}
      <HCPDetailDrawer
        isOpen={!!selectedHCP}
        onClose={() => dispatch(setSelectedHCP(null))}
        doctor={selectedHCP}
        onLogInteraction={handleLogInteraction}
        onEdit={handleOpenEdit}
      />

      {/* Add Modal */}
      <AddHCPModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Modal */}
      <EditHCPModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingHCP(null);
        }}
        doctor={editingHCP}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingHCP}
        onClose={() => setDeletingHCP(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deletingHCP?.name}?`}
        message={`Are you sure you want to delete ${deletingHCP?.name} from ${deletingHCP?.hospital}? All profile history and references will be permanently removed.`}
        confirmLabel="Confirm Delete"
      />
    </div>
  );
}