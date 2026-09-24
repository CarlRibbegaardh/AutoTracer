import { Box, Card, CardContent, Typography } from "@mui/material";
import type { StatCardProps } from "../types/StatCardProps";

/**
 * Displays a single statistic with an icon, title, and value
 *
 * @param props - Configuration for the stat card
 * @returns A Material-UI card component displaying the statistic
 */
export const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
  <Card>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Icon sx={{ fontSize: 40, color, mr: 2 }} />
        <Box>
          <Typography color="textSecondary" variant="body2">
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);
