/**
 * Creates a Flow tracer wrapper that suppresses output for runtime-filtered function names.
 */
import type { StyledExitHandle } from "@autotracer/logger";
import type { CreateRuntimeFilteredFlowTracerParams } from "./CreateRuntimeFilteredFlowTracerParams.js";

export function createRuntimeFilteredFlowTracer(
  params: CreateRuntimeFilteredFlowTracerParams
): CreateRuntimeFilteredFlowTracerParams["baseTracer"] {
  function nowMs(): number {
    if (
      typeof performance !== "undefined" &&
      typeof performance.now === "function"
    ) {
      return performance.now();
    }
    return Date.now();
  }

  function getCurrentIsFiltered(stack: readonly boolean[]): boolean {
    if (stack.length === 0) return false;
    return stack[stack.length - 1] ?? false;
  }

  function popStack(stack: boolean[]): void {
    if (stack.length === 0) return;
    stack.pop();
  }

  function getActionArg(
    functionName: string
  ): unknown[] {
    if (!params.isFilterModeEnabled()) return [];
    const action = params.createFilterAction(functionName);
    return action === undefined ? [] : [action];
  }

  function logFilterSnippetLine(functionName: string): void {
    const args = getActionArg(functionName);
    const snippet = typeof args[0] === "string" ? args[0] : undefined;
    if (!snippet) return;

    // Intentionally prints a copy/paste target.
    console.log(`%c${snippet}`, "font-size: 0.85em; font-weight: 400;");
  }

  const filteredHandleSet = new WeakSet<StyledExitHandle>();
  const activeSyncFilterStack: boolean[] = [];

  function enter(functionName: string, ...args: unknown[]): StyledExitHandle {
    const isFiltered = params.store.matchesName(functionName);
    activeSyncFilterStack.push(isFiltered);

    if (isFiltered) {
      const handle: StyledExitHandle = {
        rawLabel: functionName,
        label: "",
        startTime: nowMs(),
        level: "off",
      };
      filteredHandleSet.add(handle);
      return handle;
    }

    const handle = params.baseTracer.enter(functionName, ...args);
    logFilterSnippetLine(functionName);
    return handle;
  }

  function exit(handle: StyledExitHandle): void {
    const isFiltered = filteredHandleSet.has(handle);
    popStack(activeSyncFilterStack);
    if (isFiltered) return;
    params.baseTracer.exit(handle);
  }

  function enterAsync(
    functionName: string,
    ...args: unknown[]
  ): StyledExitHandle {
    const isFiltered = params.store.matchesName(functionName);
    if (isFiltered) {
      const handle: StyledExitHandle = {
        rawLabel: functionName,
        label: "",
        startTime: nowMs(),
        level: "off",
      };
      filteredHandleSet.add(handle);
      return handle;
    }

    const handle = params.baseTracer.enterAsync(functionName, ...args);
    logFilterSnippetLine(functionName);
    return handle;
  }

  function exitAsync(handle: StyledExitHandle): void {
    if (filteredHandleSet.has(handle)) return;
    params.baseTracer.exitAsync(handle);
  }

  function traceParameter(name: string, value: unknown): void {
    if (getCurrentIsFiltered(activeSyncFilterStack)) return;
    params.baseTracer.traceParameter(name, value);
  }

  function traceReturnValue(value: unknown): void {
    if (getCurrentIsFiltered(activeSyncFilterStack)) return;
    params.baseTracer.traceReturnValue(value);
  }

  function traceException(functionName: string, error: unknown): void {
    if (getCurrentIsFiltered(activeSyncFilterStack)) return;
    params.baseTracer.traceException(functionName, error);
  }

  function trace(...args: unknown[]): void {
    if (getCurrentIsFiltered(activeSyncFilterStack)) return;
    params.baseTracer.trace(...args);
  }

  function debug(...args: unknown[]): void {
    if (getCurrentIsFiltered(activeSyncFilterStack)) return;
    params.baseTracer.debug(...args);
  }

  void params.logger;

  return {
    enter,
    exit,
    enterAsync,
    exitAsync,
    traceParameter,
    traceReturnValue,
    traceException,
    trace,
    debug,
  };
}
