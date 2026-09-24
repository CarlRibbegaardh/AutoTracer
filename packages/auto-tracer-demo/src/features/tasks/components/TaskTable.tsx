import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import type { TaskTableProps } from "../types/TaskTableProps";
import { getStatusChipColor } from "../utils/getStatusChipColor";
import { getPriorityChipColor } from "../utils/getPriorityChipColor";

/**
 * Renders a table of tasks with edit and delete actions
 *
 * @param props - Tasks and action handlers
 * @returns A table container with task rows
 */
export const TaskTable = ({ tasks, onEdit, onDelete }: TaskTableProps) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Priority</TableCell>
          <TableCell>Due Date</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell>{task.title}</TableCell>
            <TableCell>
              <Chip
                label={task.status}
                size="small"
                color={getStatusChipColor(task.status)}
              />
            </TableCell>
            <TableCell>
              <Chip
                label={task.priority}
                size="small"
                color={getPriorityChipColor(task.priority)}
              />
            </TableCell>
            <TableCell>{task.dueDate || "No due date"}</TableCell>
            <TableCell>
              <IconButton size="small" onClick={() => onEdit(task.id)}>
                <EditIcon />
              </IconButton>
              <IconButton size="small" onClick={() => onDelete(task.id)}>
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
