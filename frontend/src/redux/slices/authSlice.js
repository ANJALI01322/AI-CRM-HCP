import { createSlice } from "@reduxjs/toolkit";
import api, { getStoredToken, setAuthToken } from "../../services/api";
import { apiThunk } from "../apiThunk";

export const login = apiThunk("auth/login", async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });
  setAuthToken(data.accessToken);
  return data.user;
});

/** Restores a session after reload: uses the tab's stored token only if /auth/me accepts it. */
export const restoreSession = apiThunk("auth/restore", async () => {
  const token = getStoredToken();
  if (!token) return null;
  setAuthToken(token);
  try {
    const { data } = await api.get("/auth/me");
    return data;
  } catch (err) {
    setAuthToken(null);
    if (err?.response?.status === 401) return null;
    throw err;
  }
});

const initialState = {
  user: null,
  status: "restoring", // 'restoring' | 'idle' | 'loading' | 'authenticated'
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      setAuthToken(null);
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload || action.error.message;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = action.payload ? "authenticated" : "idle";
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.status = "idle";
      });
  },
});

export const { logout } = authSlice.actions;

export const ROLE_LABELS = { rep: "Field Rep", manager: "Manager" };

export default authSlice.reducer;
