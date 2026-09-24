# Analyze A Trace

An AutoTracer trace records what the instrumented code and tracer runtime observed during the capture window. Use it to explain a working execution path or locate the first point where behavior differs from what you expected.

Do not treat absence as proof until a known eligible function or component has produced output in the same build.

## Explain an Execution

Start with the reproduced action and input. Follow the observed function boundaries, parameters, returns, React state/prop values, and render activity. Connect the events to the source that transfers those values. A useful explanation answers: what ran, what values changed, what result appeared, and which boundaries were not observed.

For a bug, add the expected behavior and find the earliest observed divergence. For exploration, no divergence is required. See [Your First Trace](/guide/first-trace) for a complete interaction and an annotated explanation.

## Read FlowTracer Output

| Output | Meaning |
| --- | --- |
| `→ functionName` | The instrumented function was entered. |
| `param name: value` | The value received by a named parameter at entry. |
| `returned: value` | The value produced by an instrumented return expression. |
| `Exception in functionName:` | The function threw while exception logging was enabled. The original error is rethrown. |
| `← functionName (elapsed: …)` | The function reached its generated exit instrumentation. The elapsed time covers the interval since entry. |
| `(async started)` and `(async completed, elapsed: …)` | Entry and exit markers for an async function. These lines are flat rather than nested. |

For synchronous functions, indentation or console groups show calls that completed inside the parent function's traced interval. A function that was not selected by the build transform is absent, so two adjacent traced calls are not necessarily direct caller and callee.

`returned: Promise` describes the value at the instrumented return expression; it does not show the resolved value. Use later trace output or the application's visible result when the resolved outcome matters.

### Async Exit Is Not Always Promise Settlement

The `(async completed)` marker runs in a generated `finally` block. In `async function load() { return pendingPromise; }`, that block runs before the returned promise settles. The elapsed time therefore measures reaching the function's exit instrumentation, not necessarily completion of the returned operation. A later rejection of that returned promise also need not appear as an exception inside this function.

An explicit `await` inside the function keeps execution there until that await finishes. Detached work can still outlive the function. Keep captures open until the relevant caller has awaited the result or the application shows its expected outcome; do not use the completion label alone as the stopping condition.

FlowTracer observes selected function boundaries. It does not automatically record every statement, branch, local assignment, network payload, or function in a dependency. Instrument the source that exposes the missing values when those details matter.

To investigate a wrong result, follow the executed path from the outer operation inward. Compare parameters and returns at each traced boundary. The earliest wrong parameter, unexpected branch, exception, or return value identifies the next source location to inspect.

## Read ReactTracer Output

Each `Component render cycle` groups component activity inspected from React's commit hook. This is not a log of every component-function invocation: work abandoned before a commit, including interrupted render attempts, is not a complete separate history here. State changes describe observed snapshots, not every setter call or intermediate batched value.

| Output | Meaning |
| --- | --- |
| `Mount` | The component's initial render. |
| `Rendering` | The component function re-rendered. |
| `Reconciled` | React evaluated the component but did not re-render it. |
| `Skipped` | React performed internal work without executing the component function. |
| `Initial prop` or `Initial state` | The value observed on mount. |
| `Prop change` or `State change` | The before and after values observed for that render. |

Start with the first render cycle after the reproduced action. Look for the earliest unexpected prop or state value, an unexpected render, or the last expected render before the visible behavior diverges.

A missing component does not by itself prove that React skipped it. React output also depends on build-time component selection, fiber depth, tracked branches, `includeMount`, `includeRendered`, `includeReconciled`, `includeSkipped`, `filterEmptyNodes`, and runtime name filters.

## Read A Combined Trace

Use FlowTracer to establish which instrumented functions ran and what values crossed their boundaries. Use ReactTracer to establish which components rendered and which prop or state values changed.

Console order shows observation order, not causality. When a Flow value appears related to a later React render, verify the relationship through the shared value or a narrower capture. Adjacent lines alone are not enough.

## Decide The Next Capture

- If the first wrong value is already visible, inspect the code that produced it.
- If the trace changes from correct to incorrect between two boundaries, instrument the code between them more narrowly.
- If an expected function or component is absent, first prove that it was eligible, transformed, visible, and inside the capture window.
- If the trace is too broad to identify a first divergence, reduce build-time selection or shorten the capture window.
- If the trace is correct through the final observed boundary, move the capture boundary toward the incorrect external result.

Keep observations separate from conclusions when sharing the result. State what the trace shows, then state the inference and any remaining uncertainty.

Include the action/input, selected source and capture window, relevant trace excerpts, and source locations that connect the values. If the question is answered, finish with the observed execution explanation. If it is not, identify the missing boundary and the next capture needed. Separate browser, server, and worker output unless there is explicit evidence connecting them.

## Read Next

- [Browser Capture](/guide/capture/browser)
- [FlowTracer In Vitest](/guide/capture/flow-vitest)
- [Create A Trace From A Browser Test](/guide/capture/browser-tests)
- [Troubleshooting](/guide/troubleshooting)
