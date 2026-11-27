import { combineReducers, configureStore } from "@reduxjs/toolkit";
import hcpReducer from "./slices/hcpSlice";
import interactionReducer from "./slices/interactionSlice";
import dashboardReducer from "./slices/dashboardSlice";
import uiReducer from "./slices/uiSlice";
import catalogReducer from "./slices/catalogSlice";
import authReducer, { logout } from "./slices/authSlice";
import { onUnauthorized } from "../services/api";

const appReducer = combineReducers({
  auth: authReducer,
  hcp: hcpReducer,
  interaction: interactionReducer,
  dashboard: dashboardReducer,
  ui: uiReducer,
  catalog: catalogReducer,
});

// Logging out clears every slice so the next user never sees the previous user's data.
const rootReducer = (state, action) =>
  appReducer(action.type === logout.type ? undefined : state, action);

export const store = configureStore({ reducer: rootReducer });

onUnauthorized(() => store.dispatch(logout()));

export default store;
