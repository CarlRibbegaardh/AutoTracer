import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TaskFilter } from "../../domain";

/**
 * UI state for the application
 */
export interface UiState {
  /**
   * Current theme mode
   */
  readonly themeMode: "light" | "dark";

  /**
   * Current task filter
   */
  readonly taskFilter: TaskFilter;

  /**
   * Whether the sidebar is open
   */
  readonly sidebarOpen: boolean;
}

/**
 * Initial UI state
 */
const initialState: UiState = {
  themeMode: "light",
  taskFilter: {},
  sidebarOpen: true,
};

/**
 * UI state slice
 */
export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    /**
     * Toggle theme mode
     */
    toggleTheme: (state) => {
      state.themeMode = state.themeMode === "light" ? "dark" : "light";
    },

    /**
     * Set theme mode
     */
    setThemeMode: (state, action: PayloadAction<"light" | "dark">) => {
      state.themeMode = action.payload;
    },

    /**
     * Update task filter
     */
    setTaskFilter: (state, action: PayloadAction<TaskFilter>) => {
      state.taskFilter = action.payload;
    },

    /**
     * Clear task filter
     */
    clearTaskFilter: (state) => {
      state.taskFilter = {};
    },

    /**
     * Toggle sidebar
     */
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    /**
     * Set sidebar state
     */
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const {
  toggleTheme,
  setThemeMode,
  setTaskFilter,
  clearTaskFilter,
  toggleSidebar,
  setSidebarOpen,
} = uiSlice.actions;

export const { reducer: uiReducer } = uiSlice;
