import type { Task } from "../../../domain";

/**
 * Properties for the TaskTable component
 */
export interface TaskTableProps {
  /**
   * Array of tasks to display in the table
   */
  readonly tasks: readonly Task[];

  /**
   * Handler called when the edit button is clicked
   */
  readonly onEdit: (taskId: string) => void;

  /**
   * Handler called when the delete button is clicked
   */
  readonly onDelete: (taskId: string) => void;
}
