import { createSlice } from "@reduxjs/toolkit";
import * as crmApi from "../../services/crmApi";
import { apiThunk } from "../apiThunk";

export const fetchInteractions = apiThunk("interaction/fetchAll", () =>
  crmApi.listInteractions()
);
export const addInteraction = apiThunk("interaction/add", (payload) =>
  crmApi.createInteraction(payload)
);
export const deleteInteraction = apiThunk("interaction/delete", (id) =>
  crmApi.deleteInteraction(id)
);

const EMPTY_DRAFT = {
  doctorName: "",
  hospital: "",
  specialty: "",
  visitType: "In-Person Detailing",
  products: ["CardioPlus 50mg"],
  rawNotes: "",
  followUpDate: "",
};

const initialState = {
  items: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  currentAIResult: null,
  isGeneratingAI: false,
  activeDraft: EMPTY_DRAFT,
  searchQuery: "",
};

export const interactionSlice = createSlice({
  name: "interaction",
  initialState,
  reducers: {
    setCurrentAIResult: (state, action) => {
      state.currentAIResult = action.payload;
    },
    updateAIDraft: (state, action) => {
      if (state.currentAIResult) {
        state.currentAIResult.draft = { ...state.currentAIResult.draft, ...action.payload };
      }
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteractions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(addInteraction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.currentAIResult = null;
        state.activeDraft = EMPTY_DRAFT;
      })
      .addCase(deleteInteraction.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const {
  setCurrentAIResult,
  updateAIDraft,
  clearCurrentAIResult,
  setIsGeneratingAI,
  updateActiveDraft,
  setSearchQuery,
} = interactionSlice.actions;

export default interactionSlice.reducer;
