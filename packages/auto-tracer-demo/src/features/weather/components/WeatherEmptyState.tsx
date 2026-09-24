import { Cloud as CloudIcon } from "@mui/icons-material";
import { Paper, Typography } from "@mui/material";

/**
 * Displays guidance before the first weather request.
 *
 * @returns Empty Weather Station state
 */
export const WeatherEmptyState = () => (
  <Paper
    variant="outlined"
    sx={{ py: 9, px: 3, textAlign: "center", color: "text.secondary" }}
  >
    <CloudIcon sx={{ fontSize: 46, mb: 1.5 }} />
    <Typography variant="h6" color="text.primary">
      Select a place to begin
    </Typography>
    <Typography>
      Weather appears here after you choose a result and update the station.
    </Typography>
  </Paper>
);
