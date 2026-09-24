import { Box, TextField, MenuItem } from "@mui/material";
import type { TaskFiltersProps } from "../types/TaskFiltersProps";
import type { TaskStatus, TaskPriority } from "../../../domain";

/**
 * Renders filter controls for task status and priority
 *
 * @param props - Filter state and change handlers
 * @returns A box containing status and priority filter dropdowns
 */
export const TaskFilters = ({
  filterStatus,
  filterPriority,
  onStatusChange,
  onPriorityChange,
}: TaskFiltersProps) => (
  <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
    <TextField
      select
      label="Status"
      value={filterStatus}
      onChange={(e) => onStatusChange(e.target.value as TaskStatus | "")}
      sx={{ minWidth: 150 }}
    >
      <MenuItem value="">All</MenuItem>
      <MenuItem value="pending">Pending</MenuItem>
      <MenuItem value="in-progress">In Progress</MenuItem>
      <MenuItem value="completed">Completed</MenuItem>
      <MenuItem value="cancelled">Cancelled</MenuItem>
    </TextField>

    <TextField
      select
      label="Priority"
      value={filterPriority}
      onChange={(e) => onPriorityChange(e.target.value as TaskPriority | "")}
      sx={{ minWidth: 150 }}
    >
      <MenuItem value="">All</MenuItem>
      <MenuItem value="low">Low</MenuItem>
      <MenuItem value="medium">Medium</MenuItem>
      <MenuItem value="high">High</MenuItem>
    </TextField>
  </Box>
);
