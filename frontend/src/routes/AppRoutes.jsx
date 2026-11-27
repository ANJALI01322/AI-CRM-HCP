import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard/Dashboard";
import HCP from "../pages/HCP/HCP";
import Interaction from "../pages/Interaction/Interaction";
import Chat from "../pages/Chat/Chat";
import FollowUps from "../pages/FollowUps/FollowUps";
import Login from "../pages/Login/Login";
import NotFound from "../pages/NotFound/NotFound";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

const page = (element) => (
  <ProtectedRoute>
    <MainLayout>{element}</MainLayout>
  </ProtectedRoute>
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={page(<Dashboard />)} />
      <Route path="/hcp" element={page(<HCP />)} />
      <Route path="/interaction" element={page(<Interaction />)} />
      <Route path="/follow-ups" element={page(<FollowUps />)} />
      <Route path="/chat" element={page(<Chat />)} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
