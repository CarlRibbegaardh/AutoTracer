import {
  Box,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useGetTasksQuery, useAppSelector, selectTaskStats } from "../store";
import {
  StatCard,
  TaskStatusBarChart,
  StatusDistributionChart,
  CompletionRateCard,
  type BarChartDataPoint,
  type PieChartDataPoint,
} from "../features/dashboard";

/**
 * Dashboard page
 *
 * Displays task statistics and visualizations using recharts.
 */
export const DashboardPage = () => {
  const { isLoading } = useGetTasksQuery();
  const stats = useAppSelector(selectTaskStats);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const statusData: readonly PieChartDataPoint[] = [
    { name: "Pending", value: stats.pending, color: "#ff9800" },
    { name: "In Progress", value: stats.inProgress, color: "#2196f3" },
    { name: "Completed", value: stats.completed, color: "#4caf50" },
    { name: "Cancelled", value: stats.cancelled, color: "#f44336" },
  ];

  const barData: readonly BarChartDataPoint[] = [
    { status: "Pending", count: stats.pending },
    { status: "In Progress", count: stats.inProgress },
    { status: "Completed", count: stats.completed },
    { status: "Cancelled", count: stats.cancelled },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tasks"
            value={stats.total}
            icon={AssignmentIcon}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircleIcon}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={HourglassIcon}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overdue"
            value={stats.overdue}
            icon={WarningIcon}
            color="#f44336"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TaskStatusBarChart data={barData} />
        </Grid>

        <Grid item xs={12} md={6}>
          <StatusDistributionChart data={statusData} />
        </Grid>
      </Grid>

      <CompletionRateCard
        completionRate={stats.completionRate}
        completed={stats.completed}
        total={stats.total}
      />
    </Box>
  );
};
