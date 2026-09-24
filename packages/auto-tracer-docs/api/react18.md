# @autotracer/react18

**Automatic React render tracing with labeled state and prop changes.**

Core runtime library for tracing React component render cycles, state changes, and prop updates without manual instrumentation.

For browser-based internal web apps, the normal control surface is the [Dashboard workflow](/dashboard/webapps) when that workflow is mounted. The lower-level `globalThis.autoTracer.reactTracer` API remains useful in tests, automation, and other non-Dashboard setups.

## Installation

```bash
# Using pnpm
pnpm add @autotracer/react18

# Using npm
npm install @autotracer/react18

# Using yarn
yarn add @autotracer/react18
```

## Quick Start

Call `reactTracer()` before React renders.

```typescript
async function initializeReactTracing(): Promise<void> {
  if (import.meta.env.DEV) {
    const { reactTracer } = await import("@autotracer/react18");

    reactTracer();
  }
}

void initializeReactTracing();
```

## API Reference

### `reactTracer(options?)`

Initialize React component render tracing.

Call this before `createRoot(...).render(...)` or the equivalent framework render entrypoint.

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
    const { reactTracer } = await import("@autotracer/react18");

    const stopTracing = reactTracer({
      enabled: true,
      outputMode: "devtools",
      includeMount: "always",
      includeRendered: "always",
    });

    // Later, to stop tracing
    stopTracing();
  }
}

void initializeReactTracing();
```

### `ReactTracerOptions`

`ReactTracerOptions` is the configuration object passed to `reactTracer()`.

Initializer settings are documented in the Settings section as one page per option. Common entries include [`outputMode`](/reference/runtime/react18/config/outputMode), [`enabled`](/reference/runtime/react18/config/enabled), [`filterEmptyNodes`](/reference/runtime/react18/config/filterEmptyNodes), [`includeNonTrackedBranches`](/reference/runtime/react18/config/includeNonTrackedBranches), and [`maxFiberDepth`](/reference/runtime/react18/config/maxFiberDepth).

### `useReactTracer()`

React hook for manual component tracing (advanced usage).

**Type Signature:**

```typescript
function useReactTracer(param?: string | { name?: string }): ComponentLogger;
```

**Returns:**

`ComponentLogger`

**Usage:**

```typescript
import { useReactTracer } from '@autotracer/react18';

function MyComponent() {
  const logger = useReactTracer();
  logger.log("Hello from MyComponent");

  return <div>Content</div>;
}
```

**Note:** Usually not needed when using build-time injection plugin.

### `ComponentLogger`

`ComponentLogger` is returned by `useReactTracer()`.

- `log(message, ...args)` queues a component log message.
- `warn(message, ...args)` queues a component warning.
- `error(message, ...args)` queues a component error.
- `labelState(index, ...nameValuePairs)` associates labels with a state hook by index. This method is available at runtime, but it is intended for build-time injection and advanced harnesses rather than normal app code.

### `stopReactTracer()`

Stop the active global React tracer.

```typescript
function stopReactTracer(): void;
```

### `isReactTracerInitialized()`

Return whether the global React tracer is currently active.

This is most useful in lazy bootstrap paths where the same client entry can be reached more than once and you want to avoid calling `reactTracer()` again after it is already active.

```typescript
function isReactTracerInitialized(): boolean;
```

```typescript
import { isReactTracerInitialized, reactTracer } from "@autotracer/react18";

async function initializeTracing(): Promise<void> {
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

```typescript
import { updateReactTracerOptions } from "@autotracer/react18";

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

React tracing supports runtime name-only filtering that is persisted in `localStorage`.

### `globalThis.autoTracer.reactTracer.addFilter(match)`

Add a runtime filter. Matching is by component name only.

```javascript
globalThis.autoTracer.reactTracer.addFilter("Noisy*");
```

### `globalThis.autoTracer.reactTracer.showFilters()`

Print and return a copy/paste snippet compatible with compile-time `exclude.components` configuration.

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

Enable/disable a per-row copy/paste snippet (`autoTracer.reactTracer.addFilter("Name")`) appended to traced component rows.

```javascript
// Enable (not persisted)
globalThis.autoTracer.reactTracer.filterMode();

// Disable
globalThis.autoTracer.reactTracer.filterMode(false);
```

Notes:

- Runtime filtering matches by component name only (paths are not available at runtime).
- Runtime filters persist across reloads; `filterMode` does not.

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

Uses `console.group()` for collapsible output in browser console.

## Features

### Automatic Lifecycle Tracking

- **Mount events** - When components first render
- **Update events** - When components re-render
- **Unmount detection** - When components are removed

### State Change Detection

- **Before/after values** - See exactly what changed
- **Variable names** - Human-readable labels (with build plugin)
- **Identical value warnings** - Detects unnecessary re-renders

### Prop Change Detection

- **Changed props** - Which props caused the update
- **Prop values** - Before and after values
- **Reference changes** - Identifies prop object/array reference changes

### Filtering

- **Pattern matching** - Include/exclude by component name
- **Wildcard support** - Flexible pattern matching
- **Third-party exclusion** - Supports filtering out library components

## Integration

### With Vite

See [@autotracer/plugin-vite-react18](./plugin-vite-react18) for build-time injection.

### With Next.js

See [@autotracer/plugin-babel-react18](./plugin-babel-react18) for build-time injection.

### With Create React App

Requires ejecting or using CRACO to add Babel plugin. See [@autotracer/plugin-babel-react18](./plugin-babel-react18).

## Requirements

- React 18.0.0 or higher
- React DevTools hook (present in all standard React environments)

## Browser Compatibility

Works in all modern browsers that support:

- ES2020+ features
- React 18
- Console API (console.log, console.group)

## Performance

- **Disabled:** No tracing output is produced.
- **Enabled:** Overhead varies widely and is often dominated by console output volume and DevTools rendering in large apps.
- **Build-time injection:** Adds tracing hooks to your code; measure bundle/runtime impact in your app.

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type { ReactTracerOptions } from "@autotracer/react18";

const options: ReactTracerOptions = {
  enabled: true,
  outputMode: "devtools",
};
```

## Related Packages

- [@autotracer/plugin-vite-react18](./plugin-vite-react18) - Vite plugin for build-time injection
- [@autotracer/plugin-babel-react18](./plugin-babel-react18) - Babel plugin for build-time injection
- [@autotracer/inject-react18](./inject-react18) - Shared transform package for custom build tooling
- [@autotracer/flow](./flow) - Function execution tracer (complementary)

## Examples

### Basic Usage

```typescript
async function initializeReactTracing(): Promise<void> {
  if (import.meta.env.DEV) {
    const { reactTracer } = await import("@autotracer/react18");

    reactTracer({
      enabled: true,
    });
  }
}

void initializeReactTracing();
```

### Development Only

```typescript
async function initializeReactTracing(): Promise<void> {
  if (import.meta.env.DEV) {
    const { reactTracer } = await import("@autotracer/react18");

    reactTracer({
      enabled: true,
    });
  }
}

void initializeReactTracing();
```

### Filtered Tracing

```typescript
reactTracer({
  enabled: true,
  includeMount: "forPropsOrState",
  includeRendered: "forPropsOrState",
  includeReconciled: "never",
  includeSkipped: "never",
});
```

### With Cleanup

```typescript
const stopTracing = reactTracer({ enabled: true });

// Later...
stopTracing();
```

### Hot Module Reload

```typescript
const stopTracing = reactTracer({ enabled: true });

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stopTracing();
  });
}
```

## See Also

- [Quick Start Guide](/guide/quickstart-react)
- [Installation Guide](/guide/installation-react-vite)
- [Configuration Reference](/guide/config-react)
- [Browser Capture](/guide/capture/browser)
- [Create A Trace From A Browser Test](/guide/capture/browser-tests)
- [Troubleshooting](/guide/troubleshooting)
