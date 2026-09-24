import type { Task } from "./Task";

/**
 * Data required to create a new task
 */
export type CreateTaskData = Omit<
  Task,
  "id" | "createdAt" | "updatedAt" | "status"
> & {
  /**
   * Initial status (defaults to "pending" if not provided)
   */
  readonly status?: Task["status"];
};
