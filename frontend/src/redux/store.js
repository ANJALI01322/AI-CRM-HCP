import { configureStore } from "@reduxjs/toolkit";
import hcpReducer from "./slices/hcpSlice";
import interactionReducer from "./slices/interactionSlice";
import dashboardReducer from "./slices/dashboardSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    hcp: hcpReducer,
    interaction: interactionReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
  },
});

export default store;