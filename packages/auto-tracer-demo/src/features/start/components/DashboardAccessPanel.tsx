import { DashboardCustomizeOutlined } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";

/**
 * Provides pointer and keyboard access to the AutoTracer dashboard.
 *
 * Side effects: toggles the globally mounted dashboard widget.
 *
 * @returns Dashboard access controls.
 */
export const DashboardAccessPanel = () => (
  <Box
    sx={{
      display: "grid",
      gap: 2,
      gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1fr) minmax(0, 1fr)" },
      my: 4,
    }}
  >
    <Button
      aria-label="Toggle dashboard"
      onClick={() =>
        document.dispatchEvent(
          new KeyboardEvent("keydown", {
            altKey: true,
            key: "D",
            shiftKey: true,
          }),
        )
      }
      startIcon={<DashboardCustomizeOutlined />}
      variant="contained"
      sx={{ justifyContent: "flex-start", minHeight: 72, minWidth: 0, px: 3 }}
    >
      Toggle dashboard
    </Button>
    <Box
      sx={{
        alignItems: { xs: "flex-start", sm: "center" },
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 1,
        justifyContent: { xs: "center", sm: "space-between" },
        minHeight: 72,
        minWidth: 0,
        px: 3,
      }}
    >
      <Box>
        <Typography fontWeight={600}>Keyboard command</Typography>
        <Typography color="text.secondary" variant="body2">
          Works from any page
        </Typography>
      </Box>
      <Box
        component="kbd"
        sx={{
          bgcolor: "action.hover",
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          fontFamily: "monospace",
          fontSize: "0.875rem",
          px: 1.5,
          py: 1,
          whiteSpace: "normal",
          wordBreak: "break-word",
        }}
      >
        Alt+Shift+D
      </Box>
    </Box>
  </Box>
);
