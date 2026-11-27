import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import { fetchHCPs } from "../redux/slices/hcpSlice";
import { fetchInteractions } from "../redux/slices/interactionSlice";
import { fetchDashboardStats } from "../redux/slices/dashboardSlice";
import { fetchProducts } from "../redux/slices/catalogSlice";

export default function MainLayout({ children }) {
  const dispatch = useDispatch();
  const hcpCount = useSelector((state) => state.hcp.items.length);
  const interactionCount = useSelector((state) => state.interaction.items.length);
  const dataLoaded = useSelector(
    (state) => state.hcp.status === "succeeded" && state.interaction.status === "succeeded"
  );

  // Fetch everything in parallel once, when the signed-in shell first mounts.
  useEffect(() => {
    dispatch(fetchHCPs());
    dispatch(fetchInteractions());
    dispatch(fetchProducts());
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // One source of truth for counts: re-fetch the server-computed stats only when the data
  // actually changes after the first load (an HCP or visit was added/removed), so the
  // sidebar, navbar, cards and pages always agree without duplicate requests at startup.
  const baseline = useRef(null);
  useEffect(() => {
    if (!dataLoaded) return;
    const key = `${hcpCount}:${interactionCount}`;
    if (baseline.current === null) {
      baseline.current = key;
      return;
    }
    if (baseline.current !== key) {
      baseline.current = key;
      dispatch(fetchDashboardStats());
    }
  }, [dispatch, dataLoaded, hcpCount, interactionCount]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row antialiased overflow-x-clip">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-clip">
        <Navbar />

        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
