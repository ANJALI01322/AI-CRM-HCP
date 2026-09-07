import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDashboardStats } from "../../services/interactionService";
import { TODAY_SCHEDULE } from "../../constants/mockData";

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getDashboardStats();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  stats: {
    total_hcps: 248,
    today_visits: 12,
    interactions: 845,
    followups: 31,
    conversionRate: "68.4%",
    avgSentiment: "89% Positive",
  },
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  schedule: TODAY_SCHEDULE,
  timeRange: "This Month", // 'Today' | 'This Week' | 'This Month' | 'This Quarter'
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    updateScheduleStatus: (state, action) => {
      const { id, status } = action.payload;
      const item = state.schedule.find((s) => s.id === id);
      if (item) {
        item.status = status;
      }
    },
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = {
          ...state.stats,
          ...action.payload,
        };
      })
      .addCase(fetchDashboardStats.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { updateScheduleStatus, setTimeRange } = dashboardSlice.actions;

export default dashboardSlice.reducer;
