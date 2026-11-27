import { createSlice } from "@reduxjs/toolkit";
import { getDashboardStats } from "../../services/interactionService";
import { apiThunk } from "../apiThunk";

export const fetchDashboardStats = apiThunk("dashboard/fetchStats", () => getDashboardStats());

const initialState = {
  stats: null, // set from GET /dashboard/stats; no placeholder numbers
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

export default dashboardSlice.reducer;
