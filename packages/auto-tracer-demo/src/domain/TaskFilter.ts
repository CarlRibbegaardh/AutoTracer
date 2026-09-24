import type { TaskStatus } from "./TaskStatus";
import type { TaskPriority } from "./TaskPriority";

/**
 * Filter criteria for tasks
 */
export interface TaskFilter {
  /**
   * Filter by status
   */
  readonly status?: TaskStatus;

  /**
   * Filter by priority
   */
  readonly priority?: TaskPriority;

  /**
   * Filter by tag
   */
  readonly tag?: string;

  /**
   * Search in title and description
   */
  readonly search?: string;

  /**
   * Show only overdue tasks
   */
  readonly overdue?: boolean;
}
