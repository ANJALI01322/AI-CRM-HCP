import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { Activity } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user, status } = useSelector((state) => state.auth);
  const location = useLocation();

  if (status === "restoring") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Activity className="w-6 h-6 text-teal-400 animate-pulse" aria-label="Loading" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
