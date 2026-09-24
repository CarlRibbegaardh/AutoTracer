import { Box, Card, CardContent, Typography } from "@mui/material";

/**
 * Properties for the CompletionRateCard component
 */
export interface CompletionRateCardProps {
  /**
   * Completion rate as a decimal (0.0 to 1.0)
   */
  readonly completionRate: number;

  /**
   * Number of completed tasks
   */
  readonly completed: number;

  /**
   * Total number of tasks
   */
  readonly total: number;
}

/**
 * Displays the overall task completion rate
 *
 * @param props - Completion statistics
 * @returns A card showing completion percentage and counts
 */
export const CompletionRateCard = ({ completionRate, completed, total }: CompletionRateCardProps) => (
  <Box sx={{ mt: 3 }}>
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Completion Rate
        </Typography>
        <Typography variant="h3">
          {(completionRate * 100).toFixed(1)}%
        </Typography>
        <Typography color="textSecondary">
          {completed} of {total} tasks completed
        </Typography>
      </CardContent>
    </Card>
  </Box>
);
