import { Grid, Typography } from "@mui/material";
import {
  AccountTreeOutlined,
  HttpOutlined,
  RefreshOutlined,
} from "@mui/icons-material";
import { TracerDescription } from "./TracerDescription";

/**
 * Lists the tracing runtimes available in the demo.
 *
 * @returns The tracer overview section.
 */
export const AvailableTracers = () => (
  <section aria-labelledby="available-tracers-title">
    <Typography id="available-tracers-title" component="h2" variant="h5" mb={2}>
      Available tracers
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <TracerDescription
          name="ReactTracer"
          packageName="@autotracer/react18"
          description="Shows which React components render and what changed in their props, state, or tracked values."
          icon={RefreshOutlined}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TracerDescription
          name="FlowTracer"
          packageName="@autotracer/flow"
          description="Follows instrumented function calls, arguments, return values, and execution timing through application code."
          icon={AccountTreeOutlined}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TracerDescription
          name="NetworkTracer"
          packageName="@autotracer/network"
          description="Captures browser fetch request and response pairs, including timing and configured headers or bodies."
          icon={HttpOutlined}
        />
      </Grid>
    </Grid>
  </section>
);
