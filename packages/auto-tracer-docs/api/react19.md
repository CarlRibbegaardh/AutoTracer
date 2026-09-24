# @autotracer/react19

**Automatic React 19 render tracing with labeled state and prop changes.**

`@autotracer/react19` traces client-rendered React fibers through the React DevTools hook. It is meant for local development and restricted internal test or QA browser builds, not for public-facing production traffic.

For browser-based internal apps, the normal control surface is the [Dashboard workflow](/dashboard/webapps) when that workflow is mounted. When the Dashboard is not available, the lower-level fallback is `globalThis.autoTracer`, including `globalThis.autoTracer.setOutputMode(...)` and `globalThis.autoTracer.reactTracer`.

## Support Floor

The supported React floor is React `19.2.0` and ReactDOM `19.2.0`.

- The package peer dependency range starts at `^19.2.0`.
- The React 19 proof harness runs the runtime contract against React `19.2.0` without Babel or Vite injection.

The runtime boundary is the browser-side fiber tree. React Server Component execution and server-side actions are outside that boundary.

## Installation

```bash
# Using pnpm
pnpm add @autotracer/react19

# Using npm
npm install @autotracer/react19

# Using yarn
yarn add @autotracer/react19
```

AutoTracer exposes component structure, props, and state transitions. Keep the runtime, the build plugin, and the Dashboard out of public-facing builds. A runtime switch is useful for restricted sessions, but it is not a security boundary.

## Quick Start

Call `reactTracer()` before React renders.

```typescript
async function initializeReactTracing(): Promise<void> {
  if (import.meta.env.DEV) {
    const { reactTracer } = await import("@autotracer/react19");

    reactTracer({ enabled: false });
  }
}

void initializeReactTracing();
```

Starting with `enabled: false` installs the dormant runtime control surface without beginning an active trace. The Dashboard or `globalThis.autoTracer.reactTracer.start()` can enable tracing later in the same page session.

## API Reference

### `reactTracer(options?)`

Initialize React component render tracing.

Call this before `createRoot(...).render(...)` or the equivalent client render entrypoint.

ReactTracer starts dormant by default. Pass `enabled: true` when you want tracing to begin immediately at bootstrap.

**Type Signature:**

```typescript
function reactTracer(options?: ReactTracerOptions): () => void;
```

**Parameters:**

- `options` - Optional configuration object

**Returns:**

Function to stop tracing

**Example:**

```typescript
async function initializeReactTracing(): Promise<void> {
  if (import.meta.env.DEV) {
    const { reactTracer } = await import("@autotracer/react19");

    const stopTracing = reactTracer({
      enabled: true,
      outputMode: "devtools",
      includeMount: "always",
      includeRendered: "always",
    });

    stopTracing();
  }
}

void initializeReactTracing();
```

### `ReactTracerOptions`

`ReactTracerOptions` is the configuration object passed to `reactTracer()`.

Initializer settings are documented in the Settings section as one page per option. Common entries include [`outputMode`](/reference/runtime/react19/config/outputMode), [`enabled`](/reference/runtime/react19/config/enabled), [`filterEmptyNodes`](/reference/runtime/react19/config/filterEmptyNodes), [`includeNonTrackedBranches`](/reference/runtime/react19/config/includeNonTrackedBranches), and [`maxFiberDepth`](/reference/runtime/react19/config/maxFiberDepth).

### `useReactTracer()`

React hook for manual component tracing.

Build plugins normally inject this hook for you. Direct calls are for advanced harnesses and deliberate manual instrumentation.

**Type Signature:**

```typescript
function useReactTracer(param?: string | { name?: string }): ComponentLogger;
```

**Returns:**

`ComponentLogger`

**Usage:**

```typescript
import { useReactTracer } from "@autotracer/react19";

export function SearchPanel() {
  const tracer = useReactTracer({ name: "SearchPanel" });
  tracer.log("rendered");

  return <form>{/* fields */}</form>;
}
```

### `ComponentLogger`

`ComponentLogger` is returned by `useReactTracer()`.

- `log(message, ...args)` queues a component log message.
- `warn(message, ...args)` queues a component warning.
- `error(message, ...args)` queues a component error.
- `labelState(index, ...nameValuePairs)` associates labels with a state hook by index. This method is available at runtime, but it is mainly for build-time injection and advanced harnesses.

The React 19 runtime does not introduce a separate labeling path for `useActionState` or `useOptimistic`. The proof harness covers both hooks through the same generic `labelState()` contract used for existing state hooks.

### `stopReactTracer()`

Stop the active global React tracer.

```typescript
function stopReactTracer(): void;
```

### `isReactTracerInitialized()`

Return whether the global React tracer is currently active.

This reports active tracing, not just whether `reactTracer()` has been called. A dormant initialization with `enabled: false` leaves the browser control surface installed, but `isReactTracerInitialized()` still returns `false` until tracing becomes active.

```typescript
function isReactTracerInitialized(): boolean;
```

```typescript
import { isReactTracerInitialized, reactTracer } from "@autotracer/react19";

function initializeTracing(): void {
  if (!isReactTracerInitialized()) {
    reactTracer({ enabled: true });
  }
}
```

### `updateReactTracerOptions(options)`

Update the current tracer options dynamically.

```typescript
function updateReactTracerOptions(options: Partial<ReactTracerOptions>): void;
```

Changing `enabled` from `true` to `false` also stops active tracing.

```typescript
import { updateReactTracerOptions } from "@autotracer/react19";

updateReactTracerOptions({ enabled: false });
```

## Global Output Mode Control

The canonical AutoTracer output mode is exposed on `globalThis.autoTracer`.

### `globalThis.autoTracer.setOutputMode(mode)`

Change the canonical output mode after initialization.

```javascript
globalThis.autoTracer.setOutputMode("copy-paste");
```

### `globalThis.autoTracer.getOutputMode()`

Return the current canonical output mode.

```javascript
globalThis.autoTracer.getOutputMode();
// -> "devtools"
```

## Runtime Control (Global API)

After calling `reactTracer()`, a runtime control surface is available on `globalThis.autoTracer.reactTracer`.

In browser-based internal web apps, use the Dashboard as the normal control surface when that workflow is mounted. Use this lower-level API in tests, automation, and other non-Dashboard setups.

### `globalThis.autoTracer.reactTracer.start()`

Start tracing.

```javascript
globalThis.autoTracer.reactTracer.start();
```

### `globalThis.autoTracer.reactTracer.stop()`

Stop tracing.

```javascript
globalThis.autoTracer.reactTracer.stop();
```

### `globalThis.autoTracer.reactTracer.isEnabled()`

Return whether tracing is currently enabled.

```javascript
globalThis.autoTracer.reactTracer.isEnabled();
```

### `globalThis.autoTracer.reactTracer.setEnabledOnLoad(value)`

Enable or disable automatic startup on the next page load. This value is persisted in `localStorage`.

```javascript
globalThis.autoTracer.reactTracer.setEnabledOnLoad(true);
globalThis.autoTracer.reactTracer.getEnabledOnLoad();
// -> true
```

### `globalThis.autoTracer.reactTracer.setAutoStopAfterRenders(limit)`

Automatically stop tracing after a render-count limit. The limit counts renders since tracing was started. Pass `null` to disable auto-stop. This value is persisted in `localStorage`.

```javascript
globalThis.autoTracer.reactTracer.setAutoStopAfterRenders(20);
globalThis.autoTracer.reactTracer.getAutoStopAfterRenders();
// -> 20

globalThis.autoTracer.reactTracer.setAutoStopAfterRenders(null);
```

### `globalThis.autoTracer.reactTracer.getRenderCount()`

Return the current render count since tracing started.

```javascript
globalThis.autoTracer.reactTracer.getRenderCount();
```

### `globalThis.autoTracer.reactTracer.resetRenderCount()`

Reset the current render count to zero.

```javascript
globalThis.autoTracer.reactTracer.resetRenderCount();
```

### `globalThis.autoTracer.reactTracer.setStartTrigger(pattern)`

Start tracing automatically when a component display name matches the configured pattern. Pattern matching supports exact strings and glob-style patterns. This value is persisted in `localStorage`.

```javascript
globalThis.autoTracer.reactTracer.setStartTrigger("Checkout*");
globalThis.autoTracer.reactTracer.getStartTrigger();
// -> "Checkout*"
```

### `globalThis.autoTracer.reactTracer.setEndTrigger(pattern)`

Stop tracing automatically when a component display name matches the configured pattern. Pattern matching supports exact strings and glob-style patterns. This value is persisted in `localStorage`.

```javascript
globalThis.autoTracer.reactTracer.setEndTrigger("Confirmation");
globalThis.autoTracer.reactTracer.getEndTrigger();
// -> "Confirmation"
```

### `globalThis.autoTracer.reactTracer.setEndTriggerMode(mode)`

Control when an end-trigger match stops tracing.

- `"on-entry"`: stop before rendering; the trigger cycle is suppressed.
- `"on-exit"`: stop after rendering completes; the trigger cycle is still rendered.

```javascript
globalThis.autoTracer.reactTracer.setEndTriggerMode("on-entry");
globalThis.autoTracer.reactTracer.getEndTriggerMode();
// -> "on-entry"
```

### `globalThis.autoTracer.reactTracer.setTriggerRearmMode(mode)`

Control whether a later start trigger can start tracing again after an end trigger stops it.

- `"always"`: allow repeated trigger sequences.
- `"once"`: stay stopped until tracing is started manually.

```javascript
globalThis.autoTracer.reactTracer.setTriggerRearmMode("always");
globalThis.autoTracer.reactTracer.getTriggerRearmMode();
// -> "always"
```

### `globalThis.autoTracer.reactTracer.clearAllTriggers()`

Clear the start trigger, end trigger, and trigger modes, resetting them to their defaults.

```javascript
globalThis.autoTracer.reactTracer.clearAllTriggers();
```

## Runtime Filtering (Name-Only)

React tracing supports runtime name-only filtering that is persisted in `localStorage` when the browser storage API is available.

### `globalThis.autoTracer.reactTracer.addFilter(match)`

Add a runtime filter. Matching is by component name only.

```javascript
globalThis.autoTracer.reactTracer.addFilter("Noisy*");
```

### `globalThis.autoTracer.reactTracer.showFilters()`

Print and return a copy-paste snippet compatible with compile-time `exclude.components` configuration.

```javascript
globalThis.autoTracer.reactTracer.showFilters();
// -> exclude: { components: ["Noisy*"] }
```

### `globalThis.autoTracer.reactTracer.clearFilters()`

Clear only runtime filters.

```javascript
globalThis.autoTracer.reactTracer.clearFilters();
```

### `globalThis.autoTracer.reactTracer.filterMode(enabled?)`

Enable or disable a per-row copy-paste snippet (`autoTracer.reactTracer.addFilter("Name")`) appended to traced component rows.

```javascript
// Enable (not persisted)
globalThis.autoTracer.reactTracer.filterMode();

// Disable
globalThis.autoTracer.reactTracer.filterMode(false);
```

Notes:

- Runtime filtering matches by component name only.
- Runtime filters persist across reloads.
- `filterMode` does not persist across reloads.

## Output Format

### Indented Mode

```
Component render cycle 1:
├─ [App] Mount ⚡
│   Initial prop title: "Hello"
│   Initial state count: 0
└─ [Counter] Mount ⚡
    Initial state value: 0

Component render cycle 2:
└─ [Counter] Update
    State change value: 0 → 1
```

### Groups Mode

Uses `console.group()` for collapsible output in browser DevTools.

## See Also

- [React 19 runtime settings](/reference/runtime/react19/)
- [Dashboard workflow](/dashboard/webapps)
- [Browser Capture](/guide/capture/browser)
- [Create A Trace From A Browser Test](/guide/capture/browser-tests)
