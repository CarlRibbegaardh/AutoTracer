# @autotracer/flow

**Automatic function flow tracing with dormant mode and runtime control.**

Core runtime library for tracing JavaScript/TypeScript function execution, parameters, return values, and exceptions without manual instrumentation.

For browser-based internal web apps, use the [Dashboard workflow](/dashboard/webapps) when it is mounted. Use `globalThis.autoTracer.flowTracer` in tests, automation, and other non-Dashboard setups.

## Installation

```bash
# Using pnpm (automatically installs @autotracer/logger)
pnpm add @autotracer/flow

# Using npm
npm install @autotracer/flow

# Using yarn
yarn add @autotracer/flow
```

**Note:** `@autotracer/logger` is automatically installed as a dependency.

## Quick Start: Vite

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { flowTracer } from "@autotracer/plugin-vite-flow";

export default defineConfig({
  plugins: [flowTracer()],
});
```

When using the Vite plugin, no manual runtime initialization is required.

## Quick Start: Babel/Webpack

Lazy-load the runtime in your entry before the rest of the app executes:

```ts
const isDevelopment = process.env.NODE_ENV === "development";
const isInternalQa = process.env.REACT_APP_INTERNAL_QA === "true";

async function bootstrap(): Promise<void> {
  if (isDevelopment || isInternalQa) {
    await import("@autotracer/flow");
  }

  await import("./app");
}

void bootstrap();
```

Use `@autotracer/flow/runtime` instead when you want dormant startup and later activation through the Dashboard or `globalThis.autoTracer.flowTracer`.

## API Reference

### Side-Effect Installation

Importing `@autotracer/flow` ensures the main runtime surface exists:

- `globalThis.autoTracer`
- `globalThis.autoTracer.flowTracer` (runtime controls)
- `globalThis.__flowTracer` (internal instrumentation target)

Instrumented code resolves a local tracer binding (default: `__flowTracer`) from
`globalThis.__flowTracer` and calls `enter/exit/...` on that binding.

`globalThis.__flowTracer` is intentionally **not** the human-facing console API.
For runtime enable/disable, browser-based internal web apps normally use the Dashboard when that workflow is mounted. The lower-level `globalThis.autoTracer.flowTracer.start()` / `.stop()` API remains useful in tests, automation, and other non-Dashboard setups.

```ts
async function initializeFlowTracing(): Promise<void> {
  if (import.meta.env.DEV) {
    await import("@autotracer/flow");
  }
}

void initializeFlowTracing();
```

### `createFlowTracer(logger, config?)`

Create a FlowTracer instance for a manual tracer setup.

For normal app integrations, load `@autotracer/flow` or `@autotracer/flow/runtime` into your app instead of calling this factory.

When you do use this factory, pass a `Logger` from [@autotracer/logger](/api/logger), typically via `getLogger(name)`.

**Type Signature:**

```ts
function createFlowTracer(
  logger: Logger,
  config?: FlowTracerConfig,
): FlowTracer;
```

**Example:**

```ts
import { createFlowTracer } from "@autotracer/flow";
import { getLogger } from "@autotracer/logger";

const logger = getLogger("FlowTracer");
const tracer = createFlowTracer(logger);

const h0 = tracer.enter("myFunction");
try {
  // ... your code here ...
} finally {
  tracer.exit(h0);
}
```

### `FlowTracerConfig`

Configuration interface for `createFlowTracer()`.

```typescript
interface FlowTracerConfig {
  /**
   * Visual theme configuration
   */
  theme?: FlowThemeConfig;
}
```

## Themes

Use `theme` in `createFlowTracer(logger, config?)` only when you are creating a manual tracer instance.

If you use the Vite plugin and the global tracer installed by `@autotracer/flow`, see [FlowTracer Theme API](/themes/flow/api) and [FlowTracer Example Themes](/themes/flow/examples) for file names, load order, and repository theme examples.

## Runtime Control (Dormant Mode)

### `@autotracer/flow/runtime`

Importing `@autotracer/flow/runtime` installs the same lower-level runtime control surface as `@autotracer/flow` and then leaves FlowTracer in **dormant mode** unless `enabledOnLoad` is already set.

This does **not** create a second tracer, and it does not require a separate `@autotracer/flow` import first.

Enable dormant mode in one of these ways:

#### Option A: Vite (recommended)

Configure the Vite build plugin to inject the dormant runtime entry.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { flowTracer } from "@autotracer/plugin-vite-flow";

export default defineConfig({
  plugins: [
    flowTracer({
      runtimeControlled: true,
    }),
  ],
});
```

#### Option B: Non-Vite bundlers (manual entry import)

If you are not using the Vite plugin injection, import `@autotracer/flow/runtime` once in your app entry. Use `@autotracer/flow` instead when you want tracing to start immediately.

```ts
const isDevelopment = process.env.NODE_ENV === "development";
const isInternalQa = process.env.REACT_APP_INTERNAL_QA === "true";

async function bootstrap(): Promise<void> {
  if (isDevelopment || isInternalQa) {
    await import("@autotracer/flow/runtime");
  }

  await import("./app");
}

void bootstrap();
```

In browser-based internal web apps, use the Dashboard when that workflow is mounted. Use the lower-level runtime API below in tests, automation, and other non-Dashboard setups.

### `globalThis.autoTracer.flowTracer.start()`

Start tracing in dormant mode.

**Type Signature:**

```typescript
function start(): void;
```

**Usage:**

```javascript
// Lower-level runtime control for non-Dashboard setups
globalThis.autoTracer.flowTracer.start();
```

### `globalThis.autoTracer.flowTracer.stop()`

Stop tracing in dormant mode.

**Type Signature:**

```typescript
function stop(): void;
```

**Usage:**

```javascript
// Lower-level runtime control for non-Dashboard setups
globalThis.autoTracer.flowTracer.stop();
```

### `globalThis.autoTracer.flowTracer.isEnabled()`

Check if Flow tracing is currently enabled.

**Type Signature:**

```typescript
function isEnabled(): boolean;
```

**Usage:**

```javascript
// Lower-level runtime control for non-Dashboard setups
globalThis.autoTracer.flowTracer.isEnabled();
```

## Runtime Filtering (Name-Only)

Flow tracing supports runtime name-only filtering that is persisted in `localStorage`.

This is designed for quickly silencing noisy functions without rebuilding.

### `globalThis.autoTracer.flowTracer.addFilter(match)`

Add a runtime filter (matches by function name only; supports glob-style patterns).

```javascript
globalThis.autoTracer.flowTracer.addFilter("noise*");
```

### `globalThis.autoTracer.flowTracer.showFilters()`

Print and return the current runtime name filters as a copy/paste helper.

```javascript
globalThis.autoTracer.flowTracer.showFilters();
```

### `globalThis.autoTracer.flowTracer.clearFilters()`

Clear only runtime filters.

```javascript
globalThis.autoTracer.flowTracer.clearFilters();
```

### `globalThis.autoTracer.flowTracer.filterMode(enabled?)`

Enable/disable a per-row copy/paste snippet (`autoTracer.flowTracer.addFilter("Name")`) appended to traced function rows.

```javascript
// Enable (not persisted)
globalThis.autoTracer.flowTracer.filterMode();

// Disable
globalThis.autoTracer.flowTracer.filterMode(false);
```

Notes:

- Runtime filters persist across reloads; `filterMode` does not.
- Matching is by function name only (paths are not available at runtime).

## Tracing Modes

### Normal Mode (Active)

- Import `@autotracer/flow` (or use the Vite plugin), and tracing is active by default.

### Dormant Mode (On-Demand)

- Import `@autotracer/flow/runtime` (or set `runtimeControlled: true` in the Vite plugin). In browser-based internal web apps, activate later through the Dashboard when that workflow is mounted. In non-Dashboard setups, activate later via `globalThis.autoTracer.flowTracer.start()`.

## Output Format

### Entry Log Line

```
→ calculateTotal
param items: [{price: 10}, {price: 20}]
param discount: 0.1
```

### Exit Log Line

```
returned: 27
← calculateTotal (elapsed: 2.3ms)
```

### Async Functions

```
→ fetchUser (async started)
param id: "123"
returned: Promise
← fetchUser (async completed, elapsed: 142.7ms)
```

### Exceptions

```
→ validateInput
Exception in validateInput:
Error: Input cannot be null
```

### Nested Calls

```
→ processOrder
  → validateOrder
  ← validateOrder (elapsed: 0.6ms)
  → applyDiscount
  ← applyDiscount (elapsed: 0.4ms)
← processOrder (elapsed: 1.4ms)
```

## Features

### Automatic Function Tracing

- **Entry/exit logging** - Function start and end
- **Parameters** - All parameter values captured
- **Return values** - What functions return
- **Timing** - Execution duration for each function

### Exception Handling

- **Error capture** - Exceptions logged before thrown
- **Error context** - Function name and parameters
- **Stack traces** - Optional full stack trace

### Async Support

- **Promise handling** - Async functions traced automatically
- **Start/completion tracking** - See when async operations start and complete
- **Timing** - Async completion includes elapsed duration

### Call Stack Visualization

- **Nested calls** - Indentation shows call hierarchy
- **Groups mode** - Collapsible console groups
- **Clear flow** - Readable execution path

## Integration

### With Vite

See [@autotracer/plugin-vite-flow](./plugin-vite-flow) for build-time instrumentation.

### With Webpack/Babel

See [@autotracer/plugin-babel-flow](./plugin-babel-flow) for build-time instrumentation.

### Build Plugin Required

FlowTracer requires a build plugin to instrument your code. The runtime alone cannot trace functions.

## Requirements

- Node.js 18+ (for build process)
- Modern browser with ES2020+ support
- Build plugin configured (Vite or Babel)

## Performance

- **Dormant mode:** Logging starts off; overhead is typically low until you activate tracing.
- **Active tracing:** Overhead varies widely and is often dominated by log volume, object formatting, and DevTools rendering.

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type { FlowTracerConfig } from "@autotracer/flow";

const options: FlowTracerConfig = {};
```

## Related Packages

- [@autotracer/plugin-vite-flow](./plugin-vite-flow) - Vite plugin for build-time instrumentation
- [@autotracer/plugin-babel-flow](./plugin-babel-flow) - Babel plugin for build-time instrumentation
- [@autotracer/logger](./logger) - Internal shared logger utility used by FlowTracer
- [@autotracer/react18](./react18) - React component tracer (complementary)

## Examples

### Basic Usage

```typescript
async function initializeFlowTracing(): Promise<void> {
  if (import.meta.env.DEV) {
    await import("@autotracer/flow");
  }
}

void initializeFlowTracing();

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### Development Only

```typescript
// Use build-time configuration to keep tracing out of publicly accessible builds.
// For dormant-mode activation, lazy-load '@autotracer/flow/runtime' and use globalThis.autoTracer.flowTracer.start().
```

### Filtered Tracing

```typescript
// Filtering is applied by the build plugin.
// See @autotracer/plugin-vite-flow and @autotracer/plugin-babel-flow.
```

### With Timing and Values

```typescript
// Configure these when creating a custom tracer via createFlowTracer().
```

### Dormant Mode for QA

```typescript
async function initializeDormantFlowTracing(): Promise<void> {
  if (import.meta.env.DEV || import.meta.env.VITE_INTERNAL_QA === "true") {
    await import("@autotracer/flow/runtime");
  }
}

void initializeDormantFlowTracing();

// In browser-based internal web apps, use the Dashboard when that workflow is mounted.
// In non-Dashboard setups:
// globalThis.autoTracer.flowTracer.start();
```

### Async API Calls

```typescript
async function initializeFlowTracing(): Promise<void> {
  if (import.meta.env.DEV) {
    await import("@autotracer/flow");
  }
}

void initializeFlowTracing();

async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

// Traced automatically:
// - Logs an "(async started)" line at entry
// - Logs an "(async completed)" line after the Promise settles
// - If the async function has an explicit return statement, you may also see: "returned: Promise"
```

## Lower-Level Runtime Commands

When using dormant mode, browser-based internal web apps normally use the Dashboard when that workflow is mounted. These commands remain available as the lower-level runtime path for tests, automation, and other non-Dashboard setups:

```javascript
// Start tracing
globalThis.autoTracer.flowTracer.start();

// Stop tracing
globalThis.autoTracer.flowTracer.stop();

// Check if tracing is active
globalThis.autoTracer.flowTracer.isEnabled();

// Switch output mode (affects grouping style)
globalThis.autoTracer.setOutputMode("devtools");
globalThis.autoTracer.setOutputMode("copy-paste");
```

## See Also

- [Quick Start Guide](/guide/quickstart-flow)
- [Installation Guide](/guide/installation-flow-vite)
- [FlowTracer In Vitest](/guide/capture/flow-vitest)
- [Browser Capture](/guide/capture/browser)
- [Flow runtime settings](/reference/runtime/flow/)
- [Flow Vite settings](/reference/build/flow/vite/)
- [Troubleshooting](/guide/troubleshooting)
