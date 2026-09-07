import { createSlice } from "@reduxjs/toolkit";
import { INITIAL_INTERACTIONS } from "../../constants/mockData";

const loadInteractionsFromStorage = () => {
  try {
    const saved = localStorage.getItem("omni_crm_interactions");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Could not load interactions from localStorage", e);
  }
  return INITIAL_INTERACTIONS;
};

const saveInteractionsToStorage = (interactions) => {
  try {
    localStorage.setItem("omni_crm_interactions", JSON.stringify(interactions));
  } catch (e) {
    console.warn("Could not save interactions to localStorage", e);
  }
};

const initialState = {
  items: loadInteractionsFromStorage(),
  currentAIResult: null,
  isGeneratingAI: false,
  activeDraft: {
    doctorName: "",
    hospital: "",
    specialty: "",
    visitType: "In-Person Detailing",
    products: ["CardioPlus 50mg"],
    rawNotes: "",
    followUpDate: "",
  },
  searchQuery: "",
};

export const interactionSlice = createSlice({
  name: "interaction",
  initialState,
  reducers: {
    addInteraction: (state, action) => {
      const newInteraction = {
        id: `int-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "Completed",
        ...action.payload,
      };
      state.items.unshift(newInteraction);
      saveInteractionsToStorage(state.items);
      state.currentAIResult = null;
      state.activeDraft = {
        doctorName: "",
        hospital: "",
        specialty: "",
        visitType: "In-Person Detailing",
        products: ["CardioPlus 50mg"],
        rawNotes: "",
        followUpDate: "",
      };
    },
    deleteInteraction: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveInteractionsToStorage(state.items);
    },
    setCurrentAIResult: (state, action) => {
      state.currentAIResult = action.payload;
    },
    clearCurrentAIResult: (state) => {
      state.currentAIResult = null;
    },
    setIsGeneratingAI: (state, action) => {
      state.isGeneratingAI = action.payload;
    },
    updateActiveDraft: (state, action) => {
      state.activeDraft = { ...state.activeDraft, ...action.payload };
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  addInteraction,
  deleteInteraction,
  setCurrentAIResult,
  clearCurrentAIResult,
  setIsGeneratingAI,
  updateActiveDraft,
  setSearchQuery,
} = interactionSlice.actions;

export default interactionSlice.reducer;
