import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Stethoscope, ArrowLeft, Home } from "lucide-react";
import Button from "../../components/common/Button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center antialiased">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6 shadow-sm">
        <Stethoscope className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
        404 • Page Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
        Territory Route Not Located
      </h1>

      <p className="text-sm text-slate-500 max-w-md mt-2 leading-relaxed">
        The medical CRM page or doctor record you are attempting to access does not exist or has been moved.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Button
          variant="outline"
          size="md"
          icon={ArrowLeft}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          size="md"
          icon={Home}
          onClick={() => navigate("/")}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}