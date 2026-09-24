/**
 * Domain types for the reselect component demonstration.
 * Defines the shape of todos, users, and application state.
 */

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  tags: string[];
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AppState {
  todos: Todo[];
  user: User | null;
  filter: "all" | "completed" | "active";
  settings: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}
