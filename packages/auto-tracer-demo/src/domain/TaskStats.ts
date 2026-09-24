/**
 * Statistics about tasks
 */
export interface TaskStats {
  /**
   * Total number of tasks
   */
  readonly total: number;

  /**
   * Number of pending tasks
   */
  readonly pending: number;

  /**
   * Number of in-progress tasks
   */
  readonly inProgress: number;

  /**
   * Number of completed tasks
   */
  readonly completed: number;

  /**
   * Number of cancelled tasks
   */
  readonly cancelled: number;

  /**
   * Number of overdue tasks
   */
  readonly overdue: number;

  /**
   * Completion rate (0-1)
   */
  readonly completionRate: number;
}
