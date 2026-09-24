# Custom Filtering

Advanced filtering techniques to control exactly what AutoTracer logs.

## Overview

Custom filtering allows you to:

- **Focus on specific components or functions** during debugging
- **Reduce noise** from working components and helper paths
- **Narrow tracing at build time** with plugin include/exclude filters
- **Refine live sessions** with runtime filters, triggers, and auto-stop limits
- **Turn useful live filters into repeatable config** with copy/paste snippets

## Filtering Approaches

AutoTracer supports multiple filtering strategies:

1. **Build-time filtering** - Configure eligible files, components, and functions in plugin config
2. **Opt-in/opt-out mode** - Mark React components explicitly with pragmas
3. **Runtime name filtering** - Add and remove React or Flow filters through `globalThis.autoTracer`
4. **Triggered capture windows** - Start and stop tracing around one target journey
5. **Session limits** - Auto-stop noisy tracing runs after a render budget

## Build-Time Filtering

### Opt-In Mode

Only trace components marked with `// @trace`:

```typescript
// vite.config.ts
import { reactTracer } from "@autotracer/plugin-vite-react18";

export default defineConfig({
  plugins: [
    reactTracer.vite({
      mode: "opt-in", // Trace ONLY marked components
    }),
    react(),
  ],
});
```

```typescript
// @trace
export function ImportantComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// This won't be traced
export function IgnoredComponent() {
  return <div>I won't appear in traces</div>;
}
```

> **Note:** `include`/`exclude` component filters define the eligible set and are evaluated before pragma signals. `@trace` only operates within the eligible set — it cannot rescue a component that misses an `include.components` filter or matches an `exclude.components` filter.

**Console Output:**

```
Component render cycle 1:
├─ [ImportantComponent] Mount ⚡
│   Initial state count: 0

Component render cycle 2:
├─ [ImportantComponent] Rendering ⚡
│   State change count: 0 → 1

// No traces from IgnoredComponent
```

### Opt-Out Mode

Trace everything except marked components. `opt-out` is the default plugin mode, but this example keeps it explicit because this section is demonstrating that mode:

```typescript
// vite.config.ts
reactTracer.vite({
  mode: "opt-out",
});
```

```typescript
// This WILL be traced
export function ImportantComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// @trace-disable
export function NoisyComponent() {
  // This won't be traced
  return <div>Too much output</div>;
}
```

### Include/Exclude Patterns

Filter by file paths:

```typescript
// vite.config.ts
reactTracer.vite({
  include: {
    paths: [
      "src/features/**/*.tsx", // Trace feature components
      "src/pages/**/*.tsx", // Trace pages
    ],
  },
  exclude: {
    paths: [
      "src/ui/**/*.tsx", // Skip UI library
      "src/components/common/**/*.tsx", // Skip common components
      "**/*.test.tsx", // Skip tests
    ],
  },
});
```

**Example:**

```
src/
├── features/
│   └── user/
│       └── UserProfile.tsx ✅ Traced
├── pages/
│   └── HomePage.tsx ✅ Traced
├── ui/
│   └── Button.tsx ❌ Not traced
└── components/
    └── common/
        └── Header.tsx ❌ Not traced
```

### Component Name Filtering

Filter by component name patterns with `include.components` and `exclude.components`:

```typescript
// vite.config.ts
reactTracer.vite({
  include: {
    paths: ["src/**/*.tsx"],
    components: ["*Page", "*Feature"],
  },
  exclude: {
    components: ["Button"],
  },
});
```

```typescript
export function HomePage() {
  // ✅ Traced (matches *Page)
  return <div>Home</div>;
}

export function UserProfileFeature() {
  // ✅ Traced (matches *Feature)
  return <div>Profile</div>;
}

export function Button() {
  // ❌ Not traced (excluded explicitly)
  return <button>Click</button>;
}
```

## Runtime Filtering

React runtime filtering happens after `reactTracer()` is initialized. In browser-based internal web apps, the Dashboard is the normal control surface when it is mounted. Outside that workflow, use `globalThis.autoTracer.reactTracer`.

### Start Dormant And Enable When Needed

```typescript
async function initializeReactTracing(): Promise<void> {
  if (!import.meta.env.DEV) return;

  const { reactTracer } = await import("@autotracer/react18");

  reactTracer({
    enabled: false,
  });
}

void initializeReactTracing();
```

```javascript
globalThis.autoTracer.reactTracer.start();

// Reproduce the interaction you want to inspect.

globalThis.autoTracer.reactTracer.stop();
```

This keeps browser tracing dormant until you deliberately start a capture session.

### Runtime Name Filtering

```javascript
globalThis.autoTracer.reactTracer.addFilter("Noisy*");

globalThis.autoTracer.reactTracer.showFilters();
// -> exclude: { components: ["Noisy*"] }

globalThis.autoTracer.reactTracer.clearFilters();
```

Runtime filters match component names only and persist in `localStorage`. Use `showFilters()` when you want to turn a useful runtime filter into an `exclude.components` snippet for plugin config.

```javascript
globalThis.autoTracer.reactTracer.filterMode();

// Later, turn it off again.
globalThis.autoTracer.reactTracer.filterMode(false);
```

`filterMode()` appends a copy/paste `addFilter(...)` snippet to traced component rows so you can add runtime filters from live output without typing component names by hand. Unlike runtime filters, `filterMode()` is not persisted.

### Triggered Capture Windows

```javascript
globalThis.autoTracer.reactTracer.setStartTrigger("Checkout*");
globalThis.autoTracer.reactTracer.setEndTrigger("Confirmation");
globalThis.autoTracer.reactTracer.setEndTriggerMode("on-exit");
globalThis.autoTracer.reactTracer.setTriggerRearmMode("always");
```

This starts tracing when a matching checkout component renders and stops after the confirmation component finishes its render cycle.

### Auto-Stop Noisy Sessions

```javascript
globalThis.autoTracer.reactTracer.resetRenderCount();
globalThis.autoTracer.reactTracer.setAutoStopAfterRenders(20);
globalThis.autoTracer.reactTracer.start();

// Later, remove the limit again.
globalThis.autoTracer.reactTracer.setAutoStopAfterRenders(null);
```

Use an auto-stop limit when a noisy tree would otherwise flood the console.

## FlowTracer Filtering

FlowTracer filtering happens either at build time in the plugin config or at runtime through `globalThis.autoTracer.flowTracer`.

### Function Name Filtering

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { flowTracer } from "@autotracer/plugin-vite-flow";

export default defineConfig({
  plugins: [
    flowTracer({
      include: {
        functions: ["handle*", "process*"],
      },
      exclude: {
        functions: ["handleError"],
      },
    }),
  ],
});
```

This instruments handlers and processors while skipping one noisy function by name.

### Path Plus Function Filtering

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { flowTracer } from "@autotracer/plugin-vite-flow";

export default defineConfig({
  plugins: [
    flowTracer({
      include: {
        paths: ["src/business-logic/**/*.{ts,tsx,js,jsx}"],
        functions: ["calculate*", "process*"],
      },
      exclude: {
        functions: ["validate*"],
      },
    }),
  ],
});
```

This narrows Flow tracing to the business-logic files and the calculation or processing functions inside them.

### Runtime Name Filtering

```javascript
globalThis.autoTracer.flowTracer.addFilter("noise*");

globalThis.autoTracer.flowTracer.showFilters();
// -> exclude: { functions: ["noise*"] }

globalThis.autoTracer.flowTracer.clearFilters();
```

Runtime filters match function names only and persist in `localStorage`. Use `showFilters()` when you want to turn a useful runtime filter into an `exclude.functions` snippet for plugin config.

```javascript
globalThis.autoTracer.flowTracer.filterMode();

// Later, turn it off again.
globalThis.autoTracer.flowTracer.filterMode(false);
```

`filterMode()` appends a copy/paste `addFilter(...)` snippet to traced function rows so you can add runtime filters from live output without typing function names by hand. Unlike runtime filters, `filterMode()` is not persisted.

## Advanced Filtering Patterns

### Build-Time Scope Plus Runtime Filters

```typescript
// vite.config.ts
reactTracer.vite({
  include: {
    paths: ["src/checkout/**/*.tsx"],
    components: ["Checkout*", "Payment*"],
  },
  exclude: {
    components: ["CheckoutSpinner"],
  },
});
```

```javascript
globalThis.autoTracer.reactTracer.addFilter("PaymentDebugPanel");
globalThis.autoTracer.reactTracer.addFilter("CheckoutTelemetry*");
```

Use build-time filters to keep the eligible set small, then runtime filters to remove one-off noisy components during an investigation.

### One Journey Per Session

```javascript
globalThis.autoTracer.reactTracer.resetRenderCount();
globalThis.autoTracer.reactTracer.setAutoStopAfterRenders(25);
globalThis.autoTracer.reactTracer.setStartTrigger("Checkout*");
globalThis.autoTracer.reactTracer.setEndTrigger("Confirmation");
globalThis.autoTracer.reactTracer.setEndTriggerMode("on-exit");
```

This captures one checkout run without leaving tracing active across the rest of the app.

## Filtering Best Practices

- Use build-time filtering for permanent exclusions
- Filter noisy components (animations, mouse tracking)
- Combine multiple filtering strategies

## Debugging Filters

### Verify Filters are Working

Temporarily replace broad patterns with a short exact component list:

```typescript
reactTracer.vite({
  include: {
    paths: ["src/features/**/*.tsx"],
    components: ["HomePageFeature", "UserProfileFeature"],
  },
});
```

If only those components appear in the trace output, the component filter is working. If they still do not appear, the file likely missed `include.paths` or matched `exclude`.

### Test Candidate Patterns in a Narrow Scope

```typescript
reactTracer.vite({
  mode: "opt-in",
  include: {
    paths: ["src/features/**/*.tsx"],
    components: ["*Feature"],
  },
});
```

Then add `// @trace` to one expected match and one expected non-match. Only the matching component inside the eligible set should be injected.

## Configuration Examples

### Debugging Specific Feature

```typescript
// vite.config.ts
reactTracer.vite({
  mode: "opt-in",
  include: {
    paths: ["src/features/checkout/**/*.tsx"],
  },
});
```

```typescript
// features/checkout/CheckoutForm.tsx
// @trace
export function CheckoutForm() {
  // This will be traced
}

// features/user/UserProfile.tsx
export function UserProfile() {
  // This won't be traced
}
```

### Restricted Internal Monitoring

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const isInternalBrowserBuild =
    mode === "development" || process.env.INTERNAL_QA === "true";

  return {
    plugins: [
      reactTracer.vite({
        inject: isInternalBrowserBuild,
        mode: "opt-in",
        include: {
          paths: ["src/critical/**/*.tsx"],
        },
      }),
      react(),
    ],
  };
});
```

```typescript
// critical/PaymentProcessor.tsx
// @trace
export function PaymentProcessor() {
  // Traced only in local or restricted internal builds
}
```

### Performance Testing

```typescript
// vite.config.ts
reactTracer.vite({
  exclude: {
    paths: ["**/*.test.tsx", "**/ui/**/*.tsx", "**/animations/**/*.tsx"],
  },
});
```

## Next Steps

- [Advanced Patterns](/examples/advanced-patterns) - Complex scenarios
- [Performance Optimization](/best-practices/performance) - Optimize tracing
- [Deployment Safety](/best-practices/production) - Keep tracing out of public builds
- [Common Pitfalls](/best-practices/pitfalls) - Avoid mistakes
