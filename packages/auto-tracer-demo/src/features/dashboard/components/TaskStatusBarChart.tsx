import { Card, CardContent, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { BarChartDataPoint } from "../types/BarChartDataPoint";

/**
 * Properties for the TaskStatusBarChart component
 */
export interface TaskStatusBarChartProps {
  /**
   * Array of data points to render in the bar chart
   */
  readonly data: readonly BarChartDataPoint[];
}

/**
 * Renders a bar chart showing task counts by status
 *
 * @param props - Chart data
 * @returns A card containing a responsive bar chart
 */
export const TaskStatusBarChart = ({ data }: TaskStatusBarChartProps) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Tasks by Status
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data as BarChartDataPoint[]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="status" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);
