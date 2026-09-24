import type { Task } from "./Task";

/**
 * Data for updating an existing task
 */
export type UpdateTaskData = Partial<
  Omit<Task, "id" | "createdAt" | "updatedAt">
>;
