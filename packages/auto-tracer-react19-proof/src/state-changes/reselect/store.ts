/**
 * Redux store configuration for the reselect component demonstration.
 * Provides store factory for test isolation.
 */

import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AppState, Todo, User } from "./types";

// Initial state
const initialState: AppState = {
  todos: [
    {
      id: 1,
      text: "Learn Redux",
      completed: false,
      priority: "high",
      tags: ["learning", "redux"],
    },
    {
      id: 2,
      text: "Build App",
      completed: true,
      priority: "medium",
      tags: ["development"],
    },
    {
      id: 3,
      text: "Test Everything",
      completed: false,
      priority: "high",
      tags: ["testing", "qa"],
    },
  ],
  user: {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
  },
  filter: "all",
  settings: {
    theme: "light",
    notifications: true,
  },
};

// Create slice
const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    toggleTodo: (state, action: PayloadAction<number>) => {
      const todo = state.todos.find((t) => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    addTodo: (state, action: PayloadAction<Omit<Todo, "id">>) => {
      state.todos.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    setFilter: (
      state,
      action: PayloadAction<"all" | "completed" | "active">
    ) => {
      state.filter = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    toggleTheme: (state) => {
      state.settings.theme =
        state.settings.theme === "light" ? "dark" : "light";
    },
    toggleNotifications: (state) => {
      state.settings.notifications = !state.settings.notifications;
    },
  },
});

export const {
  toggleTodo,
  addTodo,
  setFilter,
  updateUser,
  toggleTheme,
  toggleNotifications,
} = appSlice.actions;

/**
 * Creates a fresh Redux store instance.
 * Used for test isolation to prevent state pollution between tests.
 */
export const createAppStore = () =>
  configureStore({
    reducer: {
      app: appSlice.reducer,
    },
  });
