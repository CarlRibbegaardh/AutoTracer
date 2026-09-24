import { Box, Paper, Typography } from "@mui/material";
import type { TracerDescriptionProps } from "../types/TracerDescriptionProps";

/**
 * Describes one tracer available in the demo.
 *
 * @param props - Tracer name, package, purpose, and icon.
 * @returns A compact tracer description.
 */
export const TracerDescription = ({
  name,
  packageName,
  description,
  icon: Icon,
}: TracerDescriptionProps) => (
  <Paper
    variant="outlined"
    sx={{
      display: "grid",
      gridTemplateColumns: "40px minmax(0, 1fr)",
      gap: 2,
      height: "100%",
      p: 2.5,
    }}
  >
    <Box
      sx={{
        alignItems: "center",
        bgcolor: "action.hover",
        borderRadius: 1,
        display: "flex",
        height: 40,
        justifyContent: "center",
        width: 40,
      }}
    >
      <Icon color="primary" fontSize="small" />
    </Box>
    <Box>
      <Typography component="h3" variant="h6" sx={{ fontSize: "1rem" }}>
        {name}
      </Typography>
      <Typography
        color="text.secondary"
        variant="caption"
        sx={{ display: "block", fontFamily: "monospace", mb: 1 }}
      >
        {packageName}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        {description}
      </Typography>
    </Box>
  </Paper>
);
