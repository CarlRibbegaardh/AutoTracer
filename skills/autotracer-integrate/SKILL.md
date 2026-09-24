---
name: autotracer-integrate
description: Install, configure, or repair AutoTracer in JavaScript or TypeScript projects and run a first trace. Use when a request to show what happens when code runs needs tracing set up, or a known target is silent. Use autotracer-investigate to explain an already working capture.
---

# Integrate AutoTracer

## Select the tracer

- Use ReactTracer for component renders, props, state, mounts, and re-renders. Select the runtime and build plugin matching the React major.
- Use FlowTracer for selected function boundaries, parameters, returns, exceptions, timing, and call nesting. An async exit marker does not necessarily mean a returned promise has settled.
- Use both when an execution path must be correlated with the React renders it causes.

## Preserve these invariants

- FlowTracer needs build-time instrumentation. Installing `@autotracer/flow` without a Vite or Babel transform does not instrument application functions.
- ReactTracer must initialize before the first React client render it needs to observe.
- The React DevTools hook must exist before React evaluates. On Vite, serve the HTML through the matching AutoTracer plugin so its early hook shim runs; a runtime import in a Node/jsdom test is not equivalent.
- In Vite React builds, place `reactTracer.vite(...)` before the normal React plugin so hook declarations are still available to the transform.
- Build-time eligibility is decided before `// @trace` and `// @trace-disable`; a pragma cannot include a path excluded by configuration.
- Start dormant for targeted capture. Use immediate startup only when the desired evidence begins at bootstrap or while verifying a small installation.
- Keep the build transform, runtime, and Dashboard out of publicly accessible builds. `enabled: false` is a capture state, not a build exclusion.
- Support access-restricted QA deployments, including builds using production optimization. Preserve existing QA build flags and keep transform and runtime inclusion aligned; do not replace them with development-only conditions.
- The Dashboard controls browser captures but does not display trace output.

## Configure and verify

1. Identify the React major, bundler/transform path, runtime surface, and whether relevant workspace packages are consumed as source or built output. Normally verify integration through local development or tests. Preserve QA build support for developer-operated browser captures; do not assume the agent will access or deploy to QA.
2. Select the matching packages and place the build plugin and runtime at their owning boundaries.
3. Restrict instrumentation to the source required for the intended investigation.
4. Launch the application or test using its existing run command. Exercise one known component or function and collect its actual console output before adding triggers, filters, themes, or broader include patterns. Use the local [first-run recipe](references/first-run.md) for Vite.
5. Confirm the runtime surface exists and can start and stop:
   - `globalThis.autoTracer.reactTracer`
   - `globalThis.autoTracer.flowTracer`
6. When the integration affects a publicly accessible build, build that variant and verify that no AutoTracer transform, runtime, Dashboard, or output is present.

For an integration-only request, finish with the run command, the target and observed signal, changed files, and any applicable public-build verification. Configuration alone is not a successful smoke test.

If the original request includes explaining or diagnosing execution, continue into `autotracer-investigate` when installed. Otherwise use the [capture workflows](https://docs.autotracer.dev/guide/capture/) to capture and explain the requested action. Do not end the task at installation. If execution access is unavailable, identify the exact missing capability and distinguish completed setup from unverified output.

## Conditional references

- Read [integration routing](references/integration-routing.md) when selecting packages or placing AutoTracer in Vite, Babel, Next.js, workspaces, microfrontends, or islands.
- Read [diagnostics](references/diagnostics.md) only when output, labels, transformed targets, runtime controls, or public-build exclusion do not behave as expected.

Use [docs.autotracer.dev](https://docs.autotracer.dev/) and the installed package types for current option names, defaults, peer ranges, and version-specific examples.
