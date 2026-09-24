# Use AutoTracer With an AI Agent

Ask about the code or behavior you want to understand. The agent can use AutoTracer to observe execution, investigate a missing event, or identify unnecessary React renders.

The agent normally runs the application locally or captures output from tests. For an issue that only occurs in QA, the developer usually captures it in their browser and shares the trace for analysis.

## Install the Skills

From your project directory, run:

```bash
npx skills@latest add CarlRibbegaardh/autotracer
```

Select both `autotracer-integrate` and `autotracer-investigate`. To install one, append `--skill autotracer-integrate` or `--skill autotracer-investigate`.

The [skill source](https://github.com/CarlRibbegaardh/AutoTracer/tree/main/skills) includes local recipes. Follow your agent's skill-loading instructions after installation. Installation makes the skills available; the agent still needs access to the project and a way to run tests or collect browser console output.

## Typical Questions

> What happens in this code?

The agent can run the relevant code and use FlowTracer to follow function calls, arguments, and return values.

> Why doesn't this validation run?

The agent can trace the functions leading to validation, inspect their inputs and returns, and determine whether validation was skipped, ran with unexpected values, or returned a result the caller did not use.

> Why does this state change?

The agent can use ReactTracer to observe the state change, then inspect the code and use FlowTracer to trace the functions that update it.

> How can we optimize the rendering of this page?

The agent can use ReactTracer to inspect which components render and which props or state change. ReactTracer also reports reference changes where the compared values are identical: for example, replacing an object with a new object containing the same values. The agent can locate where these objects are created and check whether preserving their references avoids unnecessary updates.

A common example is a hook returning `items ?? []`: when `items` is absent, each call creates a new empty array. If that array is passed as a prop or stored in state, ReactTracer can report the changed reference with identical values. The agent can check whether a stable fallback or memoized result would avoid the repeated reference changes.

These questions do not need to prescribe the tracing setup or capture commands. The skills guide the agent through those steps when runtime evidence is useful.

For behavior that only occurs in QA, capture the issue in your browser using the [Dashboard or runtime controls](/guide/capture/browser), then give the agent the output:

> Here is the AutoTracer output from reproducing the issue in QA. Why does this state change?

## What the Agent Should Do

1. Inspect the code and existing local run or test commands. If the developer has supplied a trace, use it to investigate the question.
2. Use `autotracer-integrate` if tracing is absent or a known target is silent. Verify one target produces output.
3. Continue with `autotracer-investigate` when the request includes understanding behavior. Prefer direct runtime controls and console collection for automation; use the Dashboard for a human-operated capture.
4. Run the action, stop after its relevant result, and collect the trace.
5. Explain observations with trace excerpts and source locations. Identify inference and unobserved boundaries explicitly.

An integration-only request can finish after verification. An execution question is complete when the agent has explained the behavior using a trace it captured or one supplied by the developer. If evidence is missing, identify what needs to be captured next.

## Review the Result

Expect the action and input, the build and capture scope, a trace artifact or excerpt, and an explanation of what ran and changed. For a bug, expect the earliest observed divergence and the next useful capture if evidence is incomplete.

Trace order alone does not establish causality. Uninstrumented functions, work outside the capture window, and other runtimes may be absent. See [Analyze a Trace](/guide/capture/analyze) for async completion and React observation limits.

Continue with [Your First Trace](/guide/first-trace), [Browser Test Capture](/guide/capture/browser-tests), or [FlowTracer in Vitest](/guide/capture/flow-vitest).
