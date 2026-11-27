import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";

// Pages load on demand, so the first screen after login downloads less JavaScript.
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const HCP = lazy(() => import("../pages/HCP/HCP"));
const Interaction = lazy(() => import("../pages/Interaction/Interaction"));
const Chat = lazy(() => import("../pages/Chat/Chat"));
const FollowUps = lazy(() => import("../pages/FollowUps/FollowUps"));
import Login from "../pages/Login/Login";
import NotFound from "../pages/NotFound/NotFound";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

// Start every page at the top. Without this, tapping a CTA far down the dashboard
// (e.g. "Log Field Detailing") opened the next page mid-scroll on phones.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageFallback() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading page">
      <div className="h-8 w-64 max-w-full rounded-lg bg-slate-200/70 animate-pulse" />
      <div className="h-40 rounded-2xl bg-slate-200/60 animate-pulse" />
      <div className="h-24 rounded-2xl bg-slate-200/50 animate-pulse" />
    </div>
  );
}

// One shared layout for all signed-in pages, so the sidebar/navbar stay mounted and the
// initial data is fetched once per session instead of again on every navigation.
function AppShell() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </MainLayout>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/hcp" element={<HCP />} />
          <Route path="/interaction" element={<Interaction />} />
          <Route path="/follow-ups" element={<FollowUps />} />
          <Route path="/chat" element={<Chat />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
