import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { type ChangeEvent, type KeyboardEvent, useState } from "react";
import { SeatEditorField } from "./SeatEditorField.js";

/**
 * Trace-focused demo page that mirrors a local draft value with a committed value.
 *
 * This page intentionally combines a remount token, a blank-state flag, and a
 * local numeric draft so render tracing can be inspected without copying an
 * external component verbatim.
 *
 * @returns Demo page for inspecting local draft state transitions in ReactTracer
 */
export const SeatReservationTracePage = () => {
  const minimumSeats = 1;
  const maximumDigits = 3;
  const seatStep = 1;
  const initialSeats = 4;
  const maximumSeats = 10 ** maximumDigits - 1;

  const [confirmedSeats, setConfirmedSeats] = useState(initialSeats);
  const [draftSeats, setDraftSeats] = useState(initialSeats);
  const [isDraftBlank, setIsDraftBlank] = useState(false);
  const [editorRevision, setEditorRevision] = useState(0);

  /**
   * Applies a valid seat count to both the local draft and the committed value.
   *
   * @param nextSeats - Next valid seat count to persist locally and externally
   */
  const applySeatCount = (nextSeats: number): void => {
    setIsDraftBlank(false);
    setDraftSeats(nextSeats);
    setConfirmedSeats(nextSeats);
  };

  /**
   * Forces the text field subtree to remount after a rejected interaction.
   */
  const rejectCurrentInput = (): void => {
    setEditorRevision((currentRevision) => {
      return currentRevision + 1;
    });
  };

  /**
   * Updates the seat draft from raw text input while preserving blank input state.
   *
   * @param event - Input change event from the seat editor
   */
  const handleSeatInputChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const rawValue = event.target.value.trim();

    if (rawValue === "") {
      setIsDraftBlank(true);
      return;
    }

    if (!/^\d+$/.test(rawValue)) {
      rejectCurrentInput();
      return;
    }

    const nextSeats = Number(rawValue);

    if (nextSeats === 0) {
      setIsDraftBlank(true);
      return;
    }

    if (nextSeats > maximumSeats) {
      rejectCurrentInput();
      return;
    }

    applySeatCount(nextSeats);
  };

  /**
   * Increases the draft seat count while honoring blank and overflow cases.
   */
  const handleIncreaseSeats = (): void => {
    if (isDraftBlank) {
      applySeatCount(minimumSeats);
      return;
    }

    const nextSeats = draftSeats + seatStep;

    if (nextSeats > maximumSeats) {
      rejectCurrentInput();
      return;
    }

    applySeatCount(nextSeats);
  };

  /**
   * Decreases the draft seat count while honoring the minimum allowed value.
   */
  const handleDecreaseSeats = (): void => {
    if (isDraftBlank) {
      applySeatCount(minimumSeats);
      return;
    }

    const nextSeats = draftSeats - seatStep;

    if (nextSeats < minimumSeats) {
      rejectCurrentInput();
      return;
    }

    applySeatCount(nextSeats);
  };

  /**
   * Prevents invalid characters and overflow before they reach the seat editor.
   *
   * @param event - Keyboard event from the seat editor input element
   */
  const handleSeatKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (event.key.length !== 1) {
      return;
    }

    const currentValue = event.currentTarget.value;
    const blocksInvalidKey =
      !/^\d$/.test(event.key) ||
      (event.key === "0" && currentValue === "") ||
      currentValue.length + 1 > maximumDigits;

    if (blocksInvalidKey) {
      event.preventDefault();
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Seat Reservation Trace
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, maxWidth: 720 }}>
        The field keeps two copies of the seat count: a <strong>draft</strong>{" "}
        (what the input shows while you type) and a <strong>committed</strong>{" "}
        value (the last valid number that was accepted). They can drift apart —
        when you clear the field the draft goes blank but the committed value
        stays put. There is also an <strong>editor revision counter</strong>{" "}
        that increments when an interaction is rejected (e.g. going below the
        minimum). The counter is passed as the React <code>key</code> of the
        seat editor component, so every increment forces React to unmount the
        old field and mount a fresh one. All four state variables are labeled,
        so ReactTracer can tell you exactly which ones changed on every
        interaction.
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 720 }}>
        <Stack spacing={3}>
          <Alert severity="info">
            Open the ReactTracer panel and start tracing, then interact with the
            field. Type a number or click Increase / Decrease to move both draft
            and committed together. Clear the field to set the blank flag. Click
            Increase at the maximum or Decrease at the minimum to bump the
            editor revision. Each interaction prints the changed state variables
            and their before/after values to the console.
          </Alert>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Button variant="outlined" onClick={handleDecreaseSeats}>
              Decrease
            </Button>

            <SeatEditorField
              key={editorRevision}
              value={isDraftBlank ? "" : draftSeats.toString()}
              onChange={handleSeatInputChange}
              onKeyDown={handleSeatKeyDown}
              error={isDraftBlank}
              helperText={
                isDraftBlank
                  ? `Enter at least ${minimumSeats} seat.`
                  : `Digits only, up to ${maximumDigits} places.`
              }
            />

            <Button variant="contained" onClick={handleIncreaseSeats}>
              Increase
            </Button>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="body1">
              Committed seats: {confirmedSeats}
            </Typography>
            <Typography variant="body1">
              Draft seats: {isDraftBlank ? "blank" : draftSeats}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Editor revision: {editorRevision}
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};
