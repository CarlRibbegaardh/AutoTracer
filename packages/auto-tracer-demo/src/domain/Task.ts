import type { TaskId } from "./TaskId";
import type { TaskPriority } from "./TaskPriority";
import type { TaskStatus } from "./TaskStatus";

/**
 * A task in the task management system
 */
export interface Task {
  /**
   * Unique identifier
   */
  readonly id: TaskId;

  /**
   * Task title
   */
  readonly title: string;

  /**
   * Detailed description of the task
   */
  readonly description: string;

  /**
   * Current status
   */
  readonly status: TaskStatus;

  /**
   * Priority level
   */
  readonly priority: TaskPriority;

  /**
   * Due date (ISO 8601 string)
   */
  readonly dueDate: string | null;

  /**
   * Creation timestamp (ISO 8601 string)
   */
  readonly createdAt: string;

  /**
   * Last update timestamp (ISO 8601 string)
   */
  readonly updatedAt: string;

  /**
   * Tags for categorization
   */
  readonly tags: readonly string[];
}
