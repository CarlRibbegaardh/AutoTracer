import type { TaskStatus, TaskPriority } from "../../../domain";

/**
 * Properties for the TaskFilters component
 */
export interface TaskFiltersProps {
  /**
   * Currently selected status filter
   */
  readonly filterStatus: TaskStatus | "";

  /**
   * Currently selected priority filter
   */
  readonly filterPriority: TaskPriority | "";

  /**
   * Handler called when status filter changes
   */
  readonly onStatusChange: (status: TaskStatus | "") => void;

  /**
   * Handler called when priority filter changes
   */
  readonly onPriorityChange: (priority: TaskPriority | "") => void;
}
