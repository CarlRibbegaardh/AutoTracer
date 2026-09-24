import { ArrowOutward } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { AvailableTracers } from "../features/start/components/AvailableTracers";
import { DashboardAccessPanel } from "../features/start/components/DashboardAccessPanel";
import { ConsoleApiReference } from "../features/tracing";

/**
 * Introduces the demo's tracing controls and available tracers.
 *
 * @returns The AutoTracer demo start page.
 */
export const StartPage = () => (
  <Box sx={{ maxWidth: 1120, mx: "auto", py: { xs: 1, md: 3 } }}>
    <Typography component="h1" variant="h3" sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
      Start tracing
    </Typography>
    <Typography color="text.secondary" sx={{ maxWidth: 720, mt: 1.5 }}>
      Open the AutoTracer dashboard, choose a tracer tab, and start capture before
      interacting with the task, weather, or trace-lab pages. Trace output appears
      in the browser developer console.
    </Typography>

    <DashboardAccessPanel />
    <AvailableTracers />
    <Box sx={{ mt: 4 }}>
      <ConsoleApiReference />
    </Box>

    <Box sx={{ borderTop: 1, borderColor: "divider", mt: 4, pt: 3 }}>
      <Typography component="h2" variant="h6" gutterBottom>
        Learn how AutoTracer works
      </Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
        The documentation covers installation, tracer selection, dashboard
        controls, capture settings, and reading trace output.
      </Typography>
      <Button
        component="a"
        endIcon={<ArrowOutward />}
        href="https://docs.autotracer.dev/"
        rel="noreferrer"
        target="_blank"
        variant="outlined"
        sx={{ maxWidth: "100%", whiteSpace: "normal" }}
      >
        Open AutoTracer documentation
      </Button>
    </Box>
  </Box>
);
