import { Card, CardContent, Typography } from "@mui/material";

/**
 * Displays the Console API reference for tracing controls
 *
 * @returns A card showing console API examples
 */
export const ConsoleApiReference = () => (
  <Card sx={{ minWidth: 0 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Console API
      </Typography>
      <Typography
        component="pre"
        sx={{
          fontFamily: "monospace",
          fontSize: "0.875rem",
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        {`// Unified controls
globalThis.startAllTracing()
globalThis.stopAllTracing()

// Output mode
globalThis.autoTracer.getOutputMode()
globalThis.autoTracer.setOutputMode("devtools")
globalThis.autoTracer.setOutputMode("copy-paste")

// React18 tracing
globalThis.autoTracer.reactTracer.start()
globalThis.autoTracer.reactTracer.stop()
globalThis.autoTracer.reactTracer.isEnabled()

// Flow tracing
globalThis.autoTracer.flowTracer.start()
globalThis.autoTracer.flowTracer.stop()
globalThis.autoTracer.flowTracer.isEnabled()`}
      </Typography>
    </CardContent>
  </Card>
);
