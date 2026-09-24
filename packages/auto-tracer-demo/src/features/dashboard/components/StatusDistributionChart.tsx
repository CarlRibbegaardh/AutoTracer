import { Card, CardContent, Typography } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { PieChartDataPoint } from "../types/PieChartDataPoint";

/**
 * Properties for the StatusDistributionChart component
 */
export interface StatusDistributionChartProps {
  /**
   * Array of data points to render in the pie chart
   */
  readonly data: readonly PieChartDataPoint[];
}

/**
 * Renders a pie chart showing task distribution by status
 *
 * @param props - Chart data
 * @returns A card containing a responsive pie chart
 */
export const StatusDistributionChart = ({ data }: StatusDistributionChartProps) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Status Distribution
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data as PieChartDataPoint[]}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name}: ${entry.value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);
