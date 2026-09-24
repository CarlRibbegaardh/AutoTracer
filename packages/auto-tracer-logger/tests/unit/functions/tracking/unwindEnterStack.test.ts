import { afterEach, describe, expect, it, vi } from "vitest";
import { unwindEnterStack } from "../../../../src/lib/functions/tracking/unwindEnterStack";
import type { ExitHandle } from "../../../../src/lib/types/ExitHandle";
import type { LogLevel } from "../../../../src/lib/types/LogLevel";

describe("unwindEnterStack", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should unwind stack from top to target index", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mockOutputFn = vi.fn().mockReturnValue(5);

    const handle1: ExitHandle = {
      label: "outer",
      level: "info" as LogLevel,
      startTime: 100,
      optionalParams: [],
    };
    const handle2: ExitHandle = {
      label: "middle",
      level: "info" as LogLevel,
      startTime: 200,
      optionalParams: [],
    };
    const handle3: ExitHandle = {
      label: "inner",
      level: "info" as LogLevel,
      startTime: 300,
      optionalParams: [],
    };

    const stack = [handle1, handle2, handle3];
    const targetIndex = 1; // Exit "middle", should unwind "inner" and "middle"

    const result = unwindEnterStack(
      stack,
      targetIndex,
      6,
      mockOutputFn,
      () => {
        return true;
      }
    );

    expect(result.newGroupStack).toBe(5);
    expect(result.newEnterStackLength).toBe(1);
    expect(mockOutputFn).toHaveBeenCalledTimes(2); // Called for handle3, handle2
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Expected to exit "inner", but got "middle". Unwinding stack...')
    );
  });

  it("should warn when target handle not found", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mockOutputFn = vi.fn().mockReturnValue(3);

    const handle1: ExitHandle = {
      label: "test",
      level: "debug" as LogLevel,
      startTime: 100,
      optionalParams: [],
    };

    const stack = [handle1];
    const targetIndex = -1; // Not found

    const result = unwindEnterStack(
      stack,
      targetIndex,
      3,
      mockOutputFn,
      () => {
        return true;
      }
    );

    expect(result.shouldReturn).toBe(true);
    expect(mockOutputFn).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("handle not found in stack")
    );
  });

  it("should warn when stack is empty on mismatch", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mockOutputFn = vi.fn();

    const stack: ExitHandle[] = [];
    const targetIndex = 0;

    const result = unwindEnterStack(
      stack,
      targetIndex,
      2,
      mockOutputFn,
      () => {
        return true;
      }
    );

    expect(result.shouldReturn).toBe(true);
    expect(mockOutputFn).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("stack is empty")
    );
  });

  it("should skip handles when shouldLog returns false", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mockOutputFn = vi.fn().mockReturnValue(4);

    const handle1: ExitHandle = {
      label: "outer",
      level: "verbose" as LogLevel,
      startTime: 100,
      optionalParams: [],
    };
    const handle2: ExitHandle = {
      label: "inner",
      level: "info" as LogLevel,
      startTime: 200,
      optionalParams: [],
    };

    const stack = [handle1, handle2];
    const targetIndex = 0;

    const shouldLogFn = (level: LogLevel) => {
      return level === "info";
    };

    const result = unwindEnterStack(
      stack,
      targetIndex,
      4,
      mockOutputFn,
      shouldLogFn
    );

    expect(result.newGroupStack).toBe(4);
    expect(result.newEnterStackLength).toBe(0);
    expect(mockOutputFn).toHaveBeenCalledTimes(1); // Only handle2 (info level)
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it("should handle undefined handles in stack gracefully", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mockOutputFn = vi.fn().mockReturnValue(2);

    const handle1: ExitHandle = {
      label: "test",
      level: "info" as LogLevel,
      startTime: 100,
      optionalParams: [],
    };

    const stack: (ExitHandle | undefined)[] = [handle1, undefined];
    const targetIndex = 0;

    const result = unwindEnterStack(
      stack as ExitHandle[],
      targetIndex,
      2,
      mockOutputFn,
      () => {
        return true;
      }
    );

    expect(result.newGroupStack).toBe(2);
    expect(result.newEnterStackLength).toBe(0);
    expect(mockOutputFn).toHaveBeenCalledTimes(1); // Only handle1, undefined skipped
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it("should return early on normal exit path (index === length - 1)", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mockOutputFn = vi.fn();

    const handle1: ExitHandle = {
      label: "test",
      level: "info" as LogLevel,
      startTime: 100,
      optionalParams: [],
    };

    const stack = [handle1];
    const targetIndex = 0; // Last item, normal exit

    const result = unwindEnterStack(
      stack,
      targetIndex,
      3,
      mockOutputFn,
      () => {
        return true;
      }
    );

    expect(result.shouldReturn).toBe(false);
    expect(result.isNormalExit).toBe(true);
    expect(mockOutputFn).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it("should provide correct target handle label in warning", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mockOutputFn = vi.fn().mockReturnValue(1);

    const handle1: ExitHandle = {
      label: "alpha",
      level: "info" as LogLevel,
      startTime: 100,
      optionalParams: [],
    };
    const handle2: ExitHandle = {
      label: "beta",
      level: "info" as LogLevel,
      startTime: 200,
      optionalParams: [],
    };

    const stack = [handle1, handle2];
    const targetIndex = 0; // Exit "alpha", but "beta" is on top

    unwindEnterStack(
      stack,
      targetIndex,
      1,
      mockOutputFn,
      () => {
        return true;
      }
    );

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Expected to exit "beta", but got "alpha". Unwinding stack...'
    );
  });

  it("should call output function with correct handle data", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const mockOutputFn = vi.fn().mockReturnValue(0);

    const handle1: ExitHandle = {
      label: "outer",
      level: "warn" as LogLevel,
      startTime: 400,
      optionalParams: [],
    };

    const handle2: ExitHandle = {
      label: "test-label",
      level: "warn" as LogLevel,
      startTime: 500,
      optionalParams: ["param1", "param2"],
    };

    const stack = [handle1, handle2];
    const targetIndex = 0; // Unwinding: exit handle1 but handle2 is on top

    unwindEnterStack(
      stack,
      targetIndex,
      2,
      mockOutputFn,
      () => {
        return true;
      }
    );

    // Should call outputFn for both handles during unwinding
    expect(mockOutputFn).toHaveBeenCalledWith(handle2, 2);
    expect(mockOutputFn).toHaveBeenCalledWith(handle1, 0);
    expect(mockOutputFn).toHaveBeenCalledTimes(2);
  });

  it("should accumulate groupStack changes through multiple unwinding steps", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    let callCount = 0;
    const mockOutputFn = vi.fn().mockImplementation(() => {
      callCount++;
      return 10 - callCount; // 9, 8, 7, ...
    });

    const handle1: ExitHandle = {
      label: "outer",
      level: "info" as LogLevel,
      startTime: 100,
      optionalParams: [],
    };
    const handle2: ExitHandle = {
      label: "middle",
      level: "info" as LogLevel,
      startTime: 200,
      optionalParams: [],
    };
    const handle3: ExitHandle = {
      label: "inner",
      level: "info" as LogLevel,
      startTime: 300,
      optionalParams: [],
    };

    const stack = [handle1, handle2, handle3];
    const targetIndex = 0; // Unwind all 3

    const result = unwindEnterStack(
      stack,
      targetIndex,
      10,
      mockOutputFn,
      () => {
        return true;
      }
    );

    expect(result.newGroupStack).toBe(7); // 10 -> 9 -> 8 -> 7
    expect(mockOutputFn).toHaveBeenCalledTimes(3);
  });
});
