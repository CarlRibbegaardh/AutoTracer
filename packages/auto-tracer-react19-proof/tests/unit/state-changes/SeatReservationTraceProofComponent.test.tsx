import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SeatReservationTraceProofComponent } from "@src/state-changes/SeatReservationTraceProofComponent";

describe("SeatReservationTraceProofComponent", () => {
  let consoleOutput: string[] = [];
  let originalLog: typeof console.log;

  beforeEach(() => {
    consoleOutput = [];
    originalLog = console.log;
    console.log = vi.fn((...args: unknown[]) => {
      consoleOutput.push(args.map(String).join(" "));
    });
  });

  afterEach(() => {
    console.log = originalLog;
  });

  it("should label duplicate numeric updates from the demo pattern without unknown", async () => {
    const user = userEvent.setup();

    const autoTracer = Reflect.get(globalThis, "autoTracer") as
      | {
          reactTracer?: {
            start: () => void;
            stop: () => void;
          };
        }
      | undefined;

    autoTracer?.reactTracer?.stop();

    render(<SeatReservationTraceProofComponent />);

    autoTracer?.reactTracer?.start();

    consoleOutput = [];

    await user.click(screen.getByText("Increase Seats"));

    const stateChangeLines = consoleOutput.filter((line) => {
      return line.includes("State change");
    });

    const stateChangeNames = stateChangeLines
      .map((line) => {
        return line.match(/State change ([^:]+):/);
      })
      .map((match) => {
        return match?.[1];
      })
      .filter((name): name is string => {
        return name !== undefined;
      });

    originalLog("\n=== SeatReservationTraceProofComponent state changes ===");
    stateChangeLines.forEach((line) => {
      originalLog(line);
    });

    const unknownChangeLine = stateChangeLines.find((line) => {
      return line.includes("State change unknown:");
    });
    const confirmedChangeLine = stateChangeLines.find((line) => {
      return line.includes("State change confirmedSeats:");
    });
    const draftChangeLine = stateChangeLines.find((line) => {
      return line.includes("State change draftSeats:");
    });

    expect(stateChangeNames).toStrictEqual([
      "confirmedSeats",
      "draftSeats",
    ]);
    expect(unknownChangeLine).toBeUndefined();
    expect(confirmedChangeLine).toBeDefined();
    expect(draftChangeLine).toBeDefined();
  });
});
