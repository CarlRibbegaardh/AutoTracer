import { createSelector } from "reselect";
import type { RootState } from "../store";
import type { Task, TaskStats } from "../../domain";
import { isPast, parseISO } from "date-fns";

/**
 * Select all tasks from RTK Query cache
 */
const selectTasksResult = (state: RootState) =>
  state.tasksApi.queries["getTasks(undefined)"]?.data as Task[] | undefined;

/**
 * Select current task filter
 */
const selectTaskFilter = (state: RootState) => state.ui.taskFilter;

/**
 * Select filtered tasks based on current filter
 */
export const selectFilteredTasks = createSelector(
  [selectTasksResult, selectTaskFilter],
  (tasks, filter) => {
    if (!tasks) return [];

    return tasks.filter((task) => {
      if (filter.status && task.status !== filter.status) return false;
      if (filter.priority && task.priority !== filter.priority) return false;
      if (filter.tag && !task.tags.includes(filter.tag)) return false;
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(searchLower);
        const matchesDesc = task.description.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesDesc) return false;
      }
      if (filter.overdue && task.dueDate) {
        const isOverdue = isPast(parseISO(task.dueDate));
        if (!isOverdue) return false;
      }
      return true;
    });
  }
);

/**
 * Compute task statistics
 */
export const selectTaskStats = createSelector(
  [selectTasksResult],
  (tasks): TaskStats => {
    if (!tasks || tasks.length === 0) {
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        overdue: 0,
        completionRate: 0,
      };
    }

    const pending = tasks.filter((t) => t.status === "pending").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const cancelled = tasks.filter((t) => t.status === "cancelled").length;
    const overdue = tasks.filter(
      (t) => t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== "completed"
    ).length;

    const completionRate = tasks.length > 0 ? completed / tasks.length : 0;

    return {
      total: tasks.length,
      pending,
      inProgress,
      completed,
      cancelled,
      overdue,
      completionRate,
    };
  }
);

/**
 * Select all unique tags
 */
export const selectAllTags = createSelector([selectTasksResult], (tasks) => {
  if (!tasks) return [];
  const tagSet = new Set<string>();
  tasks.forEach((task) => task.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
});
