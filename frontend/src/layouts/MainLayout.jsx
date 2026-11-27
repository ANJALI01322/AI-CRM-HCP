import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import { fetchHCPs } from "../redux/slices/hcpSlice";
import { fetchInteractions } from "../redux/slices/interactionSlice";

export default function MainLayout({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchHCPs());
    dispatch(fetchInteractions());
  }, [dispatch]);

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