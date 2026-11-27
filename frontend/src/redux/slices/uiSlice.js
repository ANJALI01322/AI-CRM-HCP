import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  // Session notifications added by user actions (e.g. an interaction was logged).
  // Follow-up alerts are derived from live data in the Navbar.
  notifications: [],
  readAlertIds: [],
  activeModal: null, // 'ADD_HCP' | 'EDIT_HCP' | 'GLOBAL_SEARCH' | null
  globalSearchOpen: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebarCollapse: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    setMobileSidebarOpen: (state, action) => {
      state.isMobileSidebarOpen = action.payload;
    },
    toggleMobileSidebar: (state) => {
      state.isMobileSidebarOpen = !state.isMobileSidebarOpen;
    },
    openModal: (state, action) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    setGlobalSearchOpen: (state, action) => {
      state.globalSearchOpen = action.payload;
    },
    markNotificationAsRead: (state, action) => {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif) notif.read = true;
      else if (!state.readAlertIds.includes(action.payload)) state.readAlertIds.push(action.payload);
    },
    /** payload: ids of the derived alerts currently shown. */
    markAllNotificationsAsRead: (state, action) => {
      state.notifications.forEach((n) => (n.read = true));
      for (const id of action.payload || []) {
        if (!state.readAlertIds.includes(id)) state.readAlertIds.push(id);
      }
    },
    addNotification: (state, action) => {
      state.notifications.unshift({
        id: `notif-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
        ...action.payload,
      });
    },
  },
});

export const {
  toggleSidebarCollapse,
  setMobileSidebarOpen,
  toggleMobileSidebar,
  openModal,
  closeModal,
  setGlobalSearchOpen,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  addNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
