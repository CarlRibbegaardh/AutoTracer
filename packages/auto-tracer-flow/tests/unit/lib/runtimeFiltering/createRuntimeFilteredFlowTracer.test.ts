import { describe, expect, it, vi } from "vitest";
import type { StyledExitHandle } from "@autotracer/logger";
import { createRuntimeFilteredFlowTracer } from "../../../../src/lib/runtimeFiltering/createRuntimeFilteredFlowTracer";

type MinimalFlowTracer = {
  readonly enter: (functionName: string, ...args: unknown[]) => StyledExitHandle;
  readonly exit: (handle: StyledExitHandle) => void;
  readonly enterAsync: (
    functionName: string,
    ...args: unknown[]
  ) => StyledExitHandle;
  readonly exitAsync: (handle: StyledExitHandle) => void;
  readonly traceParameter: (name: string, value: unknown) => void;
  readonly traceReturnValue: (value: unknown) => void;
  readonly traceException: (functionName: string, error: unknown) => void;
  readonly trace: (...args: unknown[]) => void;
  readonly debug: (...args: unknown[]) => void;
};

type RuntimeNameFilterStore = {
  readonly addFilter: (match: string) => void;
  readonly clearFilters: () => void;
  readonly getFilters: () => readonly string[];
  readonly matchesName: (name: string) => boolean;
};

function createStore(): RuntimeNameFilterStore {
  const filters: string[] = [];
  return {
    addFilter: (match) => {
      if (!filters.includes(match)) filters.push(match);
    },
    clearFilters: () => {
      filters.length = 0;
    },
    getFilters: () => {
      return [...filters];
    },
    matchesName: (name) => {
      return filters.includes(name);
    },
  };
}

function createHandle(rawLabel: string): StyledExitHandle {
  return {
    rawLabel,
    label: "",
    startTime: 0,
    level: "off",
  };
}

describe("createRuntimeFilteredFlowTracer", () => {
  it("suppresses enter/exit logs for filtered function names", () => {
    const logger = {
      trace: () => {
        return;
      },
    };

    const base: MinimalFlowTracer = {
      enter: (functionName, ..._args) => {
        return createHandle(functionName);
      },
      exit: (_handle) => {
        return;
      },
      enterAsync: (functionName, ..._args) => {
        return createHandle(functionName);
      },
      exitAsync: (_handle) => {
        return;
      },
      traceParameter: () => {
        return;
      },
      traceReturnValue: () => {
        return;
      },
      traceException: () => {
        return;
      },
      trace: () => {
        return;
      },
      debug: () => {
        return;
      },
    };

    const store = createStore();
    store.addFilter("noise");

    const enterSpy = vi.spyOn(base, "enter");
    const exitSpy = vi.spyOn(base, "exit");

    const tracer = createRuntimeFilteredFlowTracer({
      baseTracer: base,
      store,
      isFilterModeEnabled: () => {
        return false;
      },
      createFilterAction: () => {
        return undefined;
      },
      logger,
    });

    const h = tracer.enter("noise");
    tracer.traceParameter("x", 1);
    tracer.exit(h);

    expect(enterSpy).toHaveBeenCalledTimes(0);
    expect(exitSpy).toHaveBeenCalledTimes(0);
  });

  it("appends a copy/paste filter snippet when filterMode is enabled", () => {
    const logger = {
      trace: () => {
        return;
      },
    };

    const handle = createHandle("fn");

    const base: MinimalFlowTracer = {
      enter: (_functionName, ..._args: unknown[]) => {
        return handle;
      },
      exit: (_handle) => {
        return;
      },
      enterAsync: (_functionName, ..._args: unknown[]) => {
        return handle;
      },
      exitAsync: (_handle) => {
        return;
      },
      traceParameter: () => {
        return;
      },
      traceReturnValue: () => {
        return;
      },
      traceException: () => {
        return;
      },
      trace: () => {
        return;
      },
      debug: () => {
        return;
      },
    };

    const store = createStore();

    const enterSpy = vi.spyOn(base, "enter");

    const tracer = createRuntimeFilteredFlowTracer({
      baseTracer: base,
      store,
      isFilterModeEnabled: () => {
        return true;
      },
      createFilterAction: (functionName) => {
        return `autoTracer.flowTracer.addFilter(${JSON.stringify(functionName)})`;
      },
      logger,
    });

    const logSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => {
        return undefined;
      });

    tracer.enter("fn");

    expect(enterSpy).toHaveBeenCalledTimes(1);
    expect(enterSpy.mock.calls[0]?.length).toBe(1);

    expect(
      logSpy.mock.calls.some((call) => {
        return (
          call[0] === '%cautoTracer.flowTracer.addFilter("fn")' &&
          call[1] === "font-size: 0.85em; font-weight: 400;"
        );
      })
    ).toBe(true);

    logSpy.mockRestore();
  });
});
