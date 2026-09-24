import { Box, Paper, TextField, Button, Typography } from "@mui/material";
import { useForm } from "react-hook-form";

/**
 * LocationEditor component with react-hook-form
 * Single field form to reproduce performance issue with hook serialization
 *
 * NOTE: This component is tracked but doesn't use labelStateValue because
 * this app doesn't have the Babel plugin enabled. The freeze should still occur
 * when the auto-tracer tries to serialize the react-hook-form object returned by useForm.
 */
export function LocationEditor() {
  const formHook = useForm({
    defaultValues: {
      name: "Home",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = formHook;

  const onSubmit = (data: { name: string }) => {
    console.log("Form submitted:", data);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Location Editor
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Location Name"
            {...register("name", {
              required: "Location name is required",
            })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </Box>
        <Button type="submit" variant="contained">
          Save Location
        </Button>
      </form>
    </Paper>
  );
}
