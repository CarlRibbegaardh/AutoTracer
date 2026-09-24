# Integration diagnostics

Locate the failing layer before changing configuration.

## No runtime surface

If `globalThis.autoTracer?.reactTracer` or `globalThis.autoTracer?.flowTracer` is absent:

- confirm the matching runtime is present in the running artifact;
- confirm its conditional import is active in the current build mode;
- for Flow Vite injection, confirm the plugin's injection path ran;
- confirm startup occurs before the instrumented modules or React render it must observe.

## Runtime exists but no output

- Check `isEnabled()` on the selected runtime control.
- Remove unrelated persisted triggers, auto-stop limits, and runtime name filters.
- Start the tracer and exercise one known eligible target.
- Confirm the platform exposes the console or log surface. The Dashboard provides controls, not log visibility.

If the known target remains silent, continue at the build-transform layer.

## Target was not transformed

Check:

- plugin active in the current mode;
- plugin order for React Vite;
- resolved source path against `include.paths` and `exclude.paths`;
- component/function name filters;
- opt-in/opt-out mode;
- effective `// @trace` or `// @trace-disable` pragma.

Inspect one transformed module or emitted artifact. A pragma does not override path or name ineligibility.

## React output works but labels are missing

This isolates the fault to build instrumentation.

- Confirm the component source passed through the matching React transform.
- Inspect `labelHooks`, `labelHooksPattern`, include/exclude rules, and pragma mode.
- Inspect transformed output for injected label calls.
- Check whether the state originates in a custom hook or syntax outside the configured label pattern.

## React component missing from visible output

After proving it was transformed and tracing was active, inspect runtime visibility in this order:

1. `maxFiberDepth`
2. `includeNonTrackedBranches`
3. `includeMount`, `includeRendered`, `includeReconciled`, and `includeSkipped`
4. `filterEmptyNodes`
5. runtime component-name filters

## Flow function missing

After proving its module was transformed:

- confirm the function passed include/exclude name filters and pragma mode;
- confirm instrumented code resolves `globalThis.__flowTracer` before execution;
- check runtime name filters, which match names only and have no source-path information;
- keep the capture open through async completion when that completion is the expected evidence.

## Workspace resolution or HMR

- Determine whether the importer is workspace source or emitted `dist`.
- Resolve the injected runtime import from the importer, not merely from the repository root.
- If ReactTracer stops after HMR, call the cleanup function returned by `reactTracer()` from the hot-dispose handler. Restart the development server if stale HMR state remains.

## Tracing appears in a public build

Remove the build plugin from that build or disable its injection and HTML effects. Condition runtime imports so the bundler can omit them. Runtime disabled state, hidden UI, hostname checks, and suppressed console methods are not build exclusion.

Inspect and run the resulting artifact. Verify absence of injected calls, runtime imports, Dashboard assets, AutoTracer globals created by the integration, and trace output.

Reference: [AutoTracer troubleshooting](https://docs.autotracer.dev/guide/troubleshooting).
