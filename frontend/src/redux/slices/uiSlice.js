import { createSlice } from "@reduxjs/toolkit";
import { NOTIFICATIONS } from "../../constants/mockData";

const initialState = {
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  notifications: NOTIFICATIONS,
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
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((n) => (n.read = true));
    },
    addNotification: (state, action) => {
      state.notifications.unshift({
        id: `notif-${Date.now()}`,
        time: "Just now",
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
