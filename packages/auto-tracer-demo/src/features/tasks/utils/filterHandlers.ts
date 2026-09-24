import type { TaskStatus, TaskPriority, TaskFilter } from "../../../domain";

/**
 * Handles status filter changes
 *
 * @param value - New status filter value
 * @param setFilterStatus - State setter for filter status
 * @param dispatchFilter - Redux dispatch function for filter action
 */
export const handleStatusFilterChange = (
  value: TaskStatus | "",
  setFilterStatus: (status: TaskStatus | "") => void,
  dispatchFilter: (filter: TaskFilter) => void
): void => {
  setFilterStatus(value);
  const filter: TaskFilter = {};
  if (value) {
    filter.status = value;
  }
  dispatchFilter(filter);
};

/**
 * Handles priority filter changes
 *
 * @param value - New priority filter value
 * @param setFilterPriority - State setter for filter priority
 * @param dispatchFilter - Redux dispatch function for filter action
 */
export const handlePriorityFilterChange = (
  value: TaskPriority | "",
  setFilterPriority: (priority: TaskPriority | "") => void,
  dispatchFilter: (filter: TaskFilter) => void
): void => {
  setFilterPriority(value);
  const filter: TaskFilter = {};
  if (value) {
    filter.priority = value;
  }
  dispatchFilter(filter);
};
