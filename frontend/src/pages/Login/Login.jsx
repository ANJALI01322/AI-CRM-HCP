import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Activity, LogIn, UserRound, ShieldCheck, AlertCircle } from "lucide-react";
import { login } from "../../redux/slices/authSlice";

// Public demo accounts created by backend/seed.py (not secrets).
const DEMO_ACCOUNTS = {
  rep: { email: "rep@demo.com", password: "Demo@123" },
  manager: { email: "manager@demo.com", password: "Demo@123" },
};

const inputClass =
  "w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, status, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const from = location.state?.from?.pathname || "/";
  if (user) return <Navigate to={from} replace />;

  const isLoading = status === "loading";

  const submit = async (credentials) => {
    if (isLoading) return;
    try {
      await dispatch(login(credentials)).unwrap();
      navigate(from, { replace: true });
    } catch {
      /* error shown from state */
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center p-4 antialiased relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-mesh opacity-20 pointer-events-none" />
      <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm space-y-6 animate-fade-in">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Activity className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
            OMNIHEALTH
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-950/90 text-teal-300 border border-teal-800">
              CLINICAL OS
            </span>
          </span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-5 shadow-2xl">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Sign in</h1>
            <p className="text-xs text-slate-400 mt-1">AI-first CRM for pharma field teams</p>
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-900 text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form
            className="space-y-3.5"
            onSubmit={(e) => {
              e.preventDefault();
              submit({ email, password });
            }}
          >
            <div>
              <label htmlFor="email" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Demo access</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => submit(DEMO_ACCOUNTS.rep)}
                className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <UserRound className="w-3.5 h-3.5 text-teal-400" /> Try demo (Rep)
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => submit(DEMO_ACCOUNTS.manager)}
                className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Try demo (Manager)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
