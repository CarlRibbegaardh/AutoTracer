# Browser Capture

For browser applications, the Dashboard is the normal control surface for a targeted capture. Direct runtime commands are available for browser-console use and automation.

## Prepare A Dormant Runtime

ReactTracer must initialize before React renders. Pass `enabled: false` when the runtime should wait for the Dashboard or a direct command:

```typescript
reactTracer({
  enabled: false,
});
```

With the Vite Flow plugin, `runtimeControlled: true` installs a dormant browser runtime. This is the default when runtime injection is enabled.

See [Dashboard For Web Apps](/dashboard/webapps) for complete ReactTracer and FlowTracer setup examples.

## Capture With The Dashboard

1. Open the application and its browser console.
2. Open the Dashboard and select the tracer.
3. Set the output mode to `copy-paste` if the trace will be copied as text.
4. Start tracing immediately before the interaction.
5. Perform the interaction and wait for its visible result.
6. Stop tracing.

The Dashboard can also configure start and end triggers, end-trigger timing, auto-stop limits, and trigger re-arming. These controls are useful when a manual click cannot isolate the required interval. See the [Dashboard Package Reference](/dashboard/reference).

The Dashboard controls capture. Trace output remains in the browser console.

## Capture From The Browser Console

Set the shared output mode, then start the installed tracer:

```javascript
globalThis.autoTracer.setOutputMode("copy-paste");
globalThis.autoTracer.flowTracer.start();
// Or: globalThis.autoTracer.reactTracer.start();
```

Perform the interaction, wait for it to finish, and stop the tracer:

```javascript
globalThis.autoTracer.flowTracer.stop();
// Or: globalThis.autoTracer.reactTracer.stop();
```

Use `isEnabled()` to check whether a tracer is currently active.

## Capture React And Flow Together

When both tracers are installed in the same browser runtime, the Dashboard's shared tracing toggle starts and stops both. The output mode on `globalThis.autoTracer` also applies to both.

The equivalent direct commands are:

```javascript
globalThis.autoTracer.setOutputMode("copy-paste");
globalThis.autoTracer.flowTracer.start();
globalThis.autoTracer.reactTracer.start();

// Perform the interaction and wait for its visible result.

globalThis.autoTracer.reactTracer.stop();
globalThis.autoTracer.flowTracer.stop();
```

The resulting console output contains the function-flow and React-render signals from the same capture window. Treat them as two views of that interval; do not infer a causal relationship from adjacent console lines alone.

## If Expected Output Is Missing

- Flow output exists only for source selected by the build transform.
- React output also depends on depth, tracked branches, `include*` settings, `filterEmptyNodes`, and runtime name filters.
- Runtime filters and trigger settings can persist in browser storage. Inspect them before repeating the capture.
- The Dashboard does not display traces; inspect the browser console.

See [Analyze A Trace](/guide/capture/analyze) to interpret the resulting output, or [Troubleshooting](/guide/troubleshooting) when a known target remains silent.
