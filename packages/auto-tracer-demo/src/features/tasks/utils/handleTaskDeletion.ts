/**
 * Handles task deletion with user confirmation
 *
 * @param taskId - ID of the task to delete
 * @param deleteTask - RTK Query mutation function
 * @returns Promise that resolves when deletion is complete
 */
export const handleTaskDeletion = async (
  taskId: string,
  deleteTask: (id: string) => Promise<unknown>
): Promise<void> => {
  const confirmed = confirm("Are you sure you want to delete this task?");
  if (confirmed) {
    await deleteTask(taskId);
  }
};
