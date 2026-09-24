import { describe, expect, it, vi } from "vitest";
import { registerXhrTerminalListeners } from "../../../src/transport/registerXhrTerminalListeners";

describe("registerXhrTerminalListeners", () => {
  it("[NET-EVENT-005][NET-NATIVE-002][NET-XHR-005] registers and removes the four native terminal listeners", () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const listeners = {
      load: vi.fn(),
      error: vi.fn(),
      abort: vi.fn(),
      timeout: vi.fn(),
    };

    const removeListeners = registerXhrTerminalListeners(
      { addEventListener, removeEventListener },
      listeners,
    );

    expect(addEventListener.mock.calls).toEqual([
      ["load", listeners.load],
      ["error", listeners.error],
      ["abort", listeners.abort],
      ["timeout", listeners.timeout],
    ]);

    removeListeners();

    expect(removeEventListener.mock.calls).toEqual([
      ["load", listeners.load],
      ["error", listeners.error],
      ["abort", listeners.abort],
      ["timeout", listeners.timeout],
    ]);
  });
});
