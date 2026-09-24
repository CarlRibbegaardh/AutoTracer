import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useGetTasksQuery, useDeleteTaskMutation, useAppSelector, selectFilteredTasks, setTaskFilter } from "../store";
import type { TaskStatus, TaskPriority } from "../domain";
import { useAppDispatch } from "../store/hooks";
import {
  TaskFilters,
  TaskTable,
  handleStatusFilterChange,
  handlePriorityFilterChange,
  handleTaskDeletion,
} from "../features/tasks";

/**
 * Task List page
 *
 * Displays tasks in a table with filtering and CRUD operations.
 */
export const TasksPage = () => {
  const { isLoading } = useGetTasksQuery();
  const filteredTasks = useAppSelector(selectFilteredTasks);
  const [deleteTask] = useDeleteTaskMutation();
  const dispatch = useAppDispatch();
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "">("");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "">("");

  const handleStatusChange = (value: TaskStatus | "") => {
    handleStatusFilterChange(
      value,
      setFilterStatus,
      (filter) => dispatch(setTaskFilter(filter))
    );
  };

  const handlePriorityChange = (value: TaskPriority | "") => {
    handlePriorityFilterChange(
      value,
      setFilterPriority,
      (filter) => dispatch(setTaskFilter(filter))
    );
  };

  const handleDelete = async (id: string) => {
    await handleTaskDeletion(id, deleteTask);
  };

  const handleEdit = (id: string) => {
    // TODO: Implement edit functionality
    console.log("Edit task:", id);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Tasks</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Task
        </Button>
      </Box>

      <TaskFilters
        filterStatus={filterStatus}
        filterPriority={filterPriority}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
      />

      <TaskTable
        tasks={filteredTasks}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {filteredTasks.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography color="textSecondary">No tasks found</Typography>
        </Box>
      )}
    </Box>
  );
};
