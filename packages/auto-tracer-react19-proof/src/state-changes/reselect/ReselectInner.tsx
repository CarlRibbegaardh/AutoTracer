/**
 * Inner component that uses Redux selectors.
 * Demonstrates various selector patterns with simple and complex data.
 */

import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useReactTracer } from "@autotracer/react19";
import {
  toggleTodo,
  addTodo,
  setFilter,
  updateUser,
  toggleTheme,
  toggleNotifications,
} from "./store";
import {
  selectUser,
  selectFilter,
  selectSettings,
  selectAllTodos,
  selectTodoCount,
  selectUserInfo,
  selectFilteredTodos,
  selectTodosByPriority,
  selectTodoStats,
} from "./selectors";
import type { createAppStore } from "./store";

type RootState = ReturnType<ReturnType<typeof createAppStore>["getState"]>;

export const ReselectInner: React.FC = () => {
  const logger = useReactTracer();
  const dispatch = useDispatch();

  // useSelector hooks
  const user = useSelector(selectUser);
  logger.labelState(0, "user", user);

  const filter = useSelector(selectFilter);
  logger.labelState(1, "filter", filter);

  const settings = useSelector(selectSettings);
  logger.labelState(2, "settings", settings);

  const allTodos = useSelector(selectAllTodos);
  logger.labelState(3, "allTodos", allTodos);

  const todoCount = useSelector(selectTodoCount);
  logger.labelState(4, "todoCount", todoCount);

  const userInfo = useSelector(selectUserInfo);
  logger.labelState(5, "userInfo", userInfo);

  const filteredTodos = useSelector(selectFilteredTodos);
  logger.labelState(6, "filteredTodos", filteredTodos);

  const todosByPriority = useSelector(selectTodosByPriority);
  logger.labelState(7, "todosByPriority", todosByPriority);

  const todoStats = useSelector(selectTodoStats);
  logger.labelState(8, "todoStats", todoStats);

  const completedTodos = useSelector((state: RootState) =>
    state.app.todos.filter((t) => t.completed)
  );
  logger.labelState(9, "completedTodos", completedTodos);

  // useMemo hook
  const highPriorityTodos = useMemo(
    () => allTodos.filter((t) => t.priority === "high"),
    [allTodos]
  );
  logger.labelState(10, "highPriorityTodos", highPriorityTodos);

  return (
    <div>
      <h2>User Info</h2>
      {user && (
        <div>
          <div>Name: {user.name}</div>
          <div>Email: {user.email}</div>
        </div>
      )}
      <button
        onClick={() =>
          dispatch(
            updateUser({ name: "Updated Name", email: "updated@example.com" })
          )
        }
      >
        Update User
      </button>

      <h2>Settings</h2>
      <div>Theme: {settings.theme}</div>
      <div>Notifications: {String(settings.notifications)}</div>
      <button onClick={() => dispatch(toggleTheme())}>Toggle Theme</button>
      <button onClick={() => dispatch(toggleNotifications())}>
        Toggle Notifications
      </button>

      <h2>Todo List</h2>
      <div>Filter: {filter}</div>
      <button onClick={() => dispatch(setFilter("all"))}>All</button>
      <button onClick={() => dispatch(setFilter("completed"))}>
        Completed
      </button>
      <button onClick={() => dispatch(setFilter("active"))}>Active</button>

      <h3>Filtered Todos ({filteredTodos.length})</h3>
      {filteredTodos.map((todo) => (
        <div key={todo.id}>
          <span
            style={{ textDecoration: todo.completed ? "line-through" : "none" }}
          >
            [{todo.priority}] {todo.text} - {todo.tags.join(", ")}
          </span>
          <button onClick={() => dispatch(toggleTodo(todo.id))}>Toggle</button>
        </div>
      ))}

      <button
        onClick={() =>
          dispatch(
            addTodo({
              text: "New Todo",
              completed: false,
              priority: "medium",
              tags: ["new"],
            })
          )
        }
      >
        Add Todo
      </button>

      <h2>Statistics</h2>
      <div>Total: {todoStats.total}</div>
      <div>Completed: {todoStats.completed}</div>
      <div>Active: {todoStats.active}</div>
      <div>Completion Rate: {todoStats.completionRate.toFixed(1)}%</div>
      <div>
        Priority: High={todoStats.byPriority.high}, Medium=
        {todoStats.byPriority.medium}, Low={todoStats.byPriority.low}
      </div>
      <div>Tags: {todoStats.uniqueTags.join(", ")}</div>

      <h2>High Priority Todos ({highPriorityTodos.length})</h2>
      {highPriorityTodos.map((todo) => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </div>
  );
};
