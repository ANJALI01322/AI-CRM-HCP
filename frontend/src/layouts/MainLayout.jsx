import React, { useEffect } from "react";
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

  useEffect(() => {
    dispatch(fetchHCPs());
    dispatch(fetchInteractions());
    dispatch(fetchProducts());
  }, [dispatch]);

  // One source of truth for counts: re-fetch the server-computed stats whenever the data changes,
  // so the sidebar, navbar, cards and pages always agree.
  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch, hcpCount, interactionCount]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
