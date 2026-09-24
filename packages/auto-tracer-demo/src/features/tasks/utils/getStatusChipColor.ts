import type { TaskStatus } from "../../../domain";

/**
 * Returns the appropriate chip color for a task status
 *
 * @param status - The task status
 * @returns Material-UI color name for the chip
 */
export const getStatusChipColor = (
  status: TaskStatus
): "success" | "primary" | "default" => {
  if (status === "completed") {
    return "success";
  }
  if (status === "in-progress") {
    return "primary";
  }
  return "default";
};
