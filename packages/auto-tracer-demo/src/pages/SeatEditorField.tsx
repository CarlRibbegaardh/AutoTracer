import { TextField } from "@mui/material";
import { type ChangeEvent, type KeyboardEvent } from "react";

/** Props for {@link SeatEditorField}. */
interface SeatEditorFieldProps {
  /** Current display value of the field — empty string when the draft is blank. */
  readonly value: string;
  /** Called on every input change event from the native text field. */
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Called on every key-down event from the native text field. */
  readonly onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  /** Whether the current value is invalid (blank draft). */
  readonly error: boolean;
  /** Helper text shown below the field. */
  readonly helperText: string;
}

/**
 * Thin wrapper around MUI {@link TextField} for the seat editor.
 *
 * Exists as a named component so ReactTracer can observe its full lifecycle,
 * including remounts triggered by a key change on the parent.
 *
 * @param props - {@link SeatEditorFieldProps}
 * @returns Seat editor text field
 */
export const SeatEditorField = ({
  value,
  onChange,
  onKeyDown,
  error,
  helperText,
}: SeatEditorFieldProps) => {
  return (
    <TextField
      label="Requested seats"
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      inputProps={{ inputMode: "numeric", onKeyDown }}
      sx={{ minWidth: { sm: 240 } }}
    />
  );
};
