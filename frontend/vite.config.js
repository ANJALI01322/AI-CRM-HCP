import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Dev only: forward /api to the local FastAPI server (uvicorn default port).
    proxy: {
      "/api": process.env.VITE_DEV_API_TARGET || "http://localhost:8000",
    },
  },
});
