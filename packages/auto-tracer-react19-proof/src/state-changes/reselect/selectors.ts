/**
 * Redux selectors for the reselect component demonstration.
 * Demonstrates simple and memoized selectors with various data types.
 */

import { createSelector } from "reselect";
import type { createAppStore } from "./store";

type RootState = ReturnType<ReturnType<typeof createAppStore>["getState"]>;

// Simple selectors (return primitives or simple objects)
export const selectUser = (state: RootState) => state.app.user;
export const selectFilter = (state: RootState) => state.app.filter;
export const selectSettings = (state: RootState) => state.app.settings;
export const selectAllTodos = (state: RootState) => state.app.todos;

/**
 * Memoized selector that returns the total count of todos.
 */
export const selectTodoCount = createSelector(
  [selectAllTodos],
  (todos) => todos.length
);

/**
 * Memoized selector that returns simplified user information.
 */
export const selectUserInfo = createSelector([selectUser], (user) =>
  user
    ? {
        name: user.name,
        email: user.email,
      }
    : null
);

/**
 * Memoized selector that filters todos based on current filter setting.
 */
export const selectFilteredTodos = createSelector(
  [selectAllTodos, selectFilter],
  (todos, filter) => {
    switch (filter) {
      case "completed":
        return todos.filter((t) => t.completed);
      case "active":
        return todos.filter((t) => !t.completed);
      default:
        return todos;
    }
  }
);

/**
 * Memoized selector that groups todos by priority level.
 */
export const selectTodosByPriority = createSelector([selectAllTodos], (todos) => {
  return {
    high: todos.filter((t) => t.priority === "high"),
    medium: todos.filter((t) => t.priority === "medium"),
    low: todos.filter((t) => t.priority === "low"),
  };
});

/**
 * Memoized selector that computes comprehensive todo statistics.
 */
export const selectTodoStats = createSelector([selectAllTodos], (todos) => {
  const completed = todos.filter((t) => t.completed).length;
  const active = todos.length - completed;
  const byPriority = {
    high: todos.filter((t) => t.priority === "high").length,
    medium: todos.filter((t) => t.priority === "medium").length,
    low: todos.filter((t) => t.priority === "low").length,
  };
  const allTags = todos.flatMap((t) => t.tags);
  const uniqueTags = [...new Set(allTags)];

  return {
    total: todos.length,
    completed,
    active,
    byPriority,
    uniqueTags,
    completionRate: todos.length > 0 ? (completed / todos.length) * 100 : 0,
  };
});
