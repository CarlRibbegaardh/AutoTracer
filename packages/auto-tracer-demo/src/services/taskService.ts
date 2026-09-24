import { useGetTasksQuery, useDeleteTaskMutation } from "../store";
import type { Task } from "../domain";

/**
 * Hook providing access to task data and mutations
 *
 * @returns Task query results and mutation functions
 */
export const useTaskService = () => {
  const { data: tasks = [], isLoading, error } = useGetTasksQuery();
  const [deleteTask] = useDeleteTaskMutation();

  return {
    tasks,
    isLoading,
    error,
    deleteTask,
  };
};

/**
 * Type definition for the return value of useTaskService
 */
export type TaskService = {
  readonly tasks: readonly Task[];
  readonly isLoading: boolean;
  readonly error: unknown;
  readonly deleteTask: (id: string) => Promise<unknown>;
};
