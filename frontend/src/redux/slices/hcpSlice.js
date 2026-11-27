import { createSlice } from "@reduxjs/toolkit";
import * as crmApi from "../../services/crmApi";
import { apiThunk } from "../apiThunk";

export const fetchHCPs = apiThunk("hcp/fetchAll", () => crmApi.listHCPs());
export const addHCP = apiThunk("hcp/add", (hcp) => crmApi.createHCP(hcp));
export const updateHCP = apiThunk("hcp/update", (hcp) => crmApi.updateHCP(hcp));
export const deleteHCP = apiThunk("hcp/delete", (id) => crmApi.deleteHCP(id));

const initialState = {
  items: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedHCP: null,
  searchQuery: "",
  filterSpecialty: "All",
  filterPriority: "All",
  filterStatus: "All",
  filterHospital: "All",
  sortBy: "name_asc", // name_asc, name_desc, priority_high, last_visit_desc
  viewMode: "table", // 'table' | 'grid'
  page: 1,
  pageSize: 8,
};

export const hcpSlice = createSlice({
  name: "hcp",
  initialState,
  reducers: {
    setSelectedHCP: (state, action) => {
      state.selectedHCP = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    setFilterSpecialty: (state, action) => {
      state.filterSpecialty = action.payload;
      state.page = 1;
    },
    setFilterPriority: (state, action) => {
      state.filterPriority = action.payload;
      state.page = 1;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
      state.page = 1;
    },
    setFilterHospital: (state, action) => {
      state.filterHospital = action.payload;
      state.page = 1;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = "";
      state.filterSpecialty = "All";
      state.filterPriority = "All";
      state.filterStatus = "All";
      state.filterHospital = "All";
      state.sortBy = "name_asc";
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHCPs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchHCPs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        if (state.selectedHCP) {
          state.selectedHCP =
            action.payload.find((h) => h.id === state.selectedHCP.id) || null;
        }
      })
      .addCase(fetchHCPs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(addHCP.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateHCP.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        if (state.selectedHCP?.id === action.payload.id) {
          state.selectedHCP = action.payload;
        }
      })
      .addCase(deleteHCP.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedHCP?.id === action.payload) {
          state.selectedHCP = null;
        }
      });
  },
});

export const {
  setSelectedHCP,
  setSearchQuery,
  setFilterSpecialty,
  setFilterPriority,
  setFilterStatus,
  setFilterHospital,
  setSortBy,
  setViewMode,
  setPage,
  resetFilters,
} = hcpSlice.actions;

export default hcpSlice.reducer;
