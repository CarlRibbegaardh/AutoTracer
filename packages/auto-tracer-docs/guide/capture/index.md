# Capture Workflows

AutoTracer helps answer what happens when code runs, whether you are exploring working code or diagnosing a bug. Begin capture immediately before the action and stop after its relevant result.

New to AutoTracer? Start with [Your First Trace](/guide/first-trace). For automated setup and execution, see [Use With an AI Agent](/guide/agents).

Choose the workflow that matches the runtime:

- [Browser capture](/guide/capture/browser) — control a dormant tracer from the Dashboard or `globalThis.autoTracer` while reproducing an interaction.
- [FlowTracer in Vitest](/guide/capture/flow-vitest) — transform selected application source and bracket one unit-test operation with runtime controls.
- [Create a trace from a browser test](/guide/capture/browser-tests) — reproduce a scenario and print its ReactTracer or FlowTracer console output for analysis.
- [Analyze a trace](/guide/capture/analyze) — interpret FlowTracer and ReactTracer output and choose the next useful capture boundary.

## Choose The Signal

Use ReactTracer for component renders, mount and re-render behavior, prop changes, state changes, and component hierarchy.

Use FlowTracer for function entry, arguments, return values, exceptions, elapsed time, async completion, and call nesting.

Use both in the same browser capture when function flow and the resulting React render are both relevant. Both tracers write to the browser console; the Dashboard can control them together.

## Keep The Capture Narrow

1. Restrict build-time `include` and `exclude` settings to the source under investigation.
2. Start the runtime dormant.
3. Start tracing immediately before the relevant operation.
4. Stop after the function completes or the expected React render is visible.
5. Use `copy-paste` output when the trace will be moved into an issue, prompt, or text file.

Tracing should remain excluded from public production builds. See [Security Best Practices](/best-practices/security).
