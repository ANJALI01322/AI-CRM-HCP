import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard/Dashboard";
import HCP from "../pages/HCP/HCP";
import Interaction from "../pages/Interaction/Interaction";
import Chat from "../pages/Chat/Chat";
import NotFound from "../pages/NotFound/NotFound";
import MainLayout from "../layouts/MainLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        }
      />

      <Route
        path="/hcp"
        element={
          <MainLayout>
            <HCP />
          </MainLayout>
        }
      />

      <Route
        path="/interaction"
        element={
          <MainLayout>
            <Interaction />
          </MainLayout>
        }
      />

      <Route
        path="/chat"
        element={
          <MainLayout>
            <Chat />
          </MainLayout>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}