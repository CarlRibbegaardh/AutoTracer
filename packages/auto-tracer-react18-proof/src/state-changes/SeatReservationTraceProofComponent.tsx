import React, { useState } from "react";
import { useReactTracer } from "@autotracer/react18";

/**
 * Minimal proof-harness component mirroring the demo page's duplicate numeric update.
 *
 * Two numeric states move from the same previous value to the same next value in
 * one render so label resolution must distinguish them without falling back to
 * `unknown`.
 *
 * @returns A minimal duplicate-state update component for proof tests
 */
export const SeatReservationTraceProofComponent: React.FC = () => {
  const logger = useReactTracer({ name: "SeatReservationTraceProofComponent" });

  const [confirmedSeats, setConfirmedSeats] = useState(4);
  logger.labelState(
    0,
    "confirmedSeats",
    confirmedSeats,
    "setConfirmedSeats",
    setConfirmedSeats
  );

  const [draftSeats, setDraftSeats] = useState(4);
  logger.labelState(
    1,
    "draftSeats",
    draftSeats,
    "setDraftSeats",
    setDraftSeats
  );

  const [isDraftBlank, setIsDraftBlank] = useState(false);
  logger.labelState(
    2,
    "isDraftBlank",
    isDraftBlank,
    "setIsDraftBlank",
    setIsDraftBlank
  );

  const [editorRevision] = useState(0);
  logger.labelState(3, "editorRevision", editorRevision);

  return (
    <div>
      <button
        onClick={() => {
          const nextSeats = draftSeats + 1;
          setIsDraftBlank(false);
          setDraftSeats(nextSeats);
          setConfirmedSeats(nextSeats);
        }}
      >
        Increase Seats
      </button>
      <input key={editorRevision} readOnly value={isDraftBlank ? "" : String(draftSeats)} />
      <div>Committed seats: {confirmedSeats}</div>
      <div>Draft seats: {isDraftBlank ? "blank" : draftSeats}</div>
    </div>
  );
};
