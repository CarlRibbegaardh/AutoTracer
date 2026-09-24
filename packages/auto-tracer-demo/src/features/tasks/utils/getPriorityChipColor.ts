import type { TaskPriority } from "../../../domain";

/**
 * Returns the appropriate chip color for a task priority
 *
 * @param priority - The task priority
 * @returns Material-UI color name for the chip
 */
export const getPriorityChipColor = (
  priority: TaskPriority
): "error" | "warning" | "default" => {
  if (priority === "high") {
    return "error";
  }
  if (priority === "medium") {
    return "warning";
  }
  return "default";
};
