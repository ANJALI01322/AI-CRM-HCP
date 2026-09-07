import { createSlice } from "@reduxjs/toolkit";
import { INITIAL_HCPS } from "../../constants/mockData";

const loadHCPsFromStorage = () => {
  try {
    const saved = localStorage.getItem("omni_crm_hcps");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Could not load HCPs from localStorage", e);
  }
  return INITIAL_HCPS;
};

const saveHCPsToStorage = (hcps) => {
  try {
    localStorage.setItem("omni_crm_hcps", JSON.stringify(hcps));
  } catch (e) {
    console.warn("Could not save HCPs to localStorage", e);
  }
};

const initialState = {
  items: loadHCPsFromStorage(),
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
    addHCP: (state, action) => {
      const newHCP = {
        id: `hcp-${Date.now()}`,
        interactionCount: 0,
        lastVisit: "Never",
        status: "Active",
        avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 90000000)}?w=150&auto=format&fit=crop&q=80`,
        ...action.payload,
      };
      state.items.unshift(newHCP);
      saveHCPsToStorage(state.items);
    },
    updateHCP: (state, action) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
        if (state.selectedHCP?.id === action.payload.id) {
          state.selectedHCP = state.items[index];
        }
        saveHCPsToStorage(state.items);
      }
    },
    deleteHCP: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      if (state.selectedHCP?.id === action.payload) {
        state.selectedHCP = null;
      }
      saveHCPsToStorage(state.items);
    },
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
});

export const {
  addHCP,
  updateHCP,
  deleteHCP,
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
