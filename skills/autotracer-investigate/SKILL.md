---
name: autotracer-investigate
description: Investigate what code does, why validation runs or is skipped, why state changes, or how to improve React rendering using AutoTracer. Capture locally or in tests, or analyze a developer-provided trace; repair silent or missing integration before making a new capture.
---

# Investigate with AutoTracer

When making a new capture, first verify that a known eligible function or component produces output. If it does not, use `autotracer-integrate` when installed, or the matching installation guide, to repair the integration. When the developer supplies a trace, analyze that evidence without requiring a new installation or capture. Do not interpret trace absence as application behavior.

## Choose the investigation

Start from the referenced code and existing tests to identify the action or input to run. Choose a capture that answers the developer's question. If a supplied trace already contains the needed evidence, analyze it directly.

### What happens in this code?

Use FlowTracer to follow the entry function, the functions it calls, and their arguments and returns. Run a representative input through the existing application or test. Explain the observed sequence and result, using source to connect the calls. Add ReactTracer when the question includes state or UI updates. State which input was run; one execution does not establish every possible path.

### Why does or doesn't this validation run?

Find the validation function and the callers that decide whether to invoke it. Use FlowTracer to run the relevant input through that path and inspect arguments, returns, and exceptions. Use source to identify conditions and early returns between observed calls. Distinguish validation that was never called from validation that received unexpected values, returned an unexpected result, or had its result ignored by the caller. Verify instrumentation before treating a missing call as evidence that validation was skipped. When useful, compare an input that triggers validation with one that does not.

### Why does this state change?

Use ReactTracer to identify the component, state value, and observed before/after change. Inspect the setter, reducer, effect, or other code that can update it, then use FlowTracer to follow the relevant update path. Connect the observed inputs and calls to that state update through source. React snapshots can combine several updates; if the trace does not identify which update caused the change, capture the candidate update functions more narrowly.

### How can we optimize the rendering of this page?

Capture a representative interaction with ReactTracer. Inspect repeated component renders and the associated prop and state changes. Pay particular attention to `(identical value)` reports: the reference changed, but ReactTracer's comparison found the values identical. `detectIdenticalValueChanges` enables these reports and is on by default. A new object or array containing the same values can therefore be a useful optimization lead.

A common example is a hook returning `items ?? []`. While `items` is absent, each execution creates a different empty array even though its contents are unchanged. Follow that value into component props or state to connect it to an identical-value report. Check whether a stable empty fallback or a memoized result is appropriate; avoid sharing an array that callers mutate.

Locate the code creating the replacement value, such as a state updater, selector, or object passed as a prop. Check whether it can preserve the existing reference when the data has not changed. The report identifies a candidate; verify the connection to the render before changing the code. Use FlowTracer if the value's creation or update path needs investigation.

When making an improvement, repeat the same interaction with the same input and tracing settings, check that behavior is preserved, and compare the identical-value reports and render activity. Distinguish reduced render activity from a measured speed improvement; fewer logged renders alone do not establish that the page is faster.

## Capture only the relevant window

Normally capture through local development or tests. For QA-only behavior, the developer usually captures the issue in their browser and supplies the output. Analyze that trace against the corresponding code and identify any additional evidence needed. Use QA directly when the user requests it and the required access is available; a local reproduction does not establish what happened in QA.

1. Restrict build-time `include` and `exclude` paths and names to the code under investigation. Use `mode: "opt-in"` with `// @trace` when only a few eligible functions or components should be instrumented.
2. Launch the app or test using its existing run command. Start dormant. For automation, use runtime controls under `globalThis.autoTracer` and collect console output with the local [capture recipes](references/capture-recipes.md). Use the Dashboard for a human-operated browser capture.
3. Start immediately before the relevant action and stop after the function completion or React render that must be captured.
4. Use triggers or auto-stop limits when manual start and stop are not precise enough.
5. Set `globalThis.autoTracer.setOutputMode("copy-paste")` before starting. Preserve the collected trace in the test result or a local artifact. Verify that the intended target appears; a passing application assertion alone does not establish that tracing worked.

Runtime trigger and filter settings can persist across reloads. Inspect them before treating missing output as application behavior.

## Account for AutoTracer behavior

- Flow output exists only for functions selected by the build transform.
- React output visibility also depends on fiber depth, tracked branches, the `include*` settings, `filterEmptyNodes`, and runtime name filters.
- Runtime filters match function or component names, not source paths, and persist when storage is available. `filterMode` does not persist.
- Async Flow output is flat rather than nested because async operations do not nest reliably in console groups.
- An async exit marker runs in generated `finally` instrumentation. A returned promise can still be pending, and its later rejection may not be logged inside that function. Wait for the relevant caller result rather than stopping on the marker alone.
- ReactTracer inspects commit activity, not every attempted render or intermediate batched state. FlowTracer does not automatically expose every statement, network payload, or dependency call.
- The Dashboard controls capture but does not display trace output.

Exclude secrets and sensitive values before capture where possible; scrub them before sharing.

## Analyze the evidence

1. State the reproduced action and input. For exploration, explain the observed execution sequence and values without requiring a bug. For diagnosis, also state the expected behavior.
2. Follow observed function boundaries, parameters, returns, state/prop changes, and renders. Connect values through the relevant source locations. For diagnosis, identify the earliest observed divergence.
3. Separate trace facts from inference. In particular, adjacent Flow and React lines do not prove causality; separate runtimes need explicit evidence connecting them.
4. Narrow or move the capture boundary when the question cannot be answered from observed events.

Do not diagnose application behavior from missing output until build eligibility, runtime state, visibility settings, and the capture window have been ruled out.

## Completion

Return an explanation tied to trace events and source, with relevant excerpts. Include the action, input, command, and capture scope when known. State whether you captured the trace or analyzed output supplied by the developer. Identify missing evidence and the next capture only if needed; do not claim to have reproduced a supplied trace yourself.

## Conditional references

- Read [Browser Capture](https://docs.autotracer.dev/guide/capture/browser) for the Dashboard, direct console controls, triggers, copy-paste output, or combined React and Flow capture.
- Read [FlowTracer In Vitest](https://docs.autotracer.dev/guide/capture/flow-vitest) when the capture will run from a unit test.
- Read [Create A Trace From A Browser Test](https://docs.autotracer.dev/guide/capture/browser-tests) when Playwright or another browser runner will reproduce the behavior and expose its console output for analysis.
- Read [Analyze A Trace](https://docs.autotracer.dev/guide/capture/analyze) before drawing conclusions from FlowTracer, ReactTracer, or combined output.
- Read [instrumentation topology](references/instrumentation-topology.md) for the documented monorepo, microfrontend, island, or non-browser setup.

Use [docs.autotracer.dev](https://docs.autotracer.dev/) and installed package types for the current runtime-control methods and configuration shapes.
