# Performance Optimization

Best practices for minimizing the performance impact of AutoTracer in your applications.

## Overview

AutoTracer introduces some overhead for logging and instrumentation. These guidelines help you minimize that impact while maximizing debugging value.

## General Principles

### 1. Development-Only by Default

**The best performance optimization is to keep tracing out of publicly accessible builds.**

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  plugins: [
    reactTracer.vite({
      inject: mode === "development",
    }),
    react(),
  ],
}));
```

### 2. Use Dormant Mode

When tracing must be available in a restricted internal test/QA deployment, use dormant mode:

```typescript
// Entry file (run once, before using runtime controls)
async function bootstrap(): Promise<void> {
  await import("@autotracer/flow/runtime"); // Starts dormant

  await import("./app");
}

void bootstrap();

// In browser-based internal web apps, start tracing from the Dashboard when it is mounted.
// In non-Dashboard setups, activate only when needed:
globalThis.autoTracer.flowTracer.start();
```

Use `@autotracer/flow` instead when you want tracing available immediately on startup.

**Performance Impact:**

- **Dormant mode:** Logging starts off; overhead is typically low until you activate tracing.
- **Active mode:** Overhead varies widely and is often dominated by console output volume, DevTools rendering, and object formatting.

In large apps, treat tracing as an interactive debugging tool: enable it right before the action you care about, then turn it off immediately.

### 3. Selective Tracing

Trace only what you need:

```javascript
// ✅ Good: Specific patterns
{
  "include": {
    "functions": ["handle*", "on*", "fetch*"]
  }
}

// ❌ Bad: Trace everything
{
  "include": {
    "functions": ["*"]
  }
}
```

## ReactTracer Performance

### Component-Level Optimization

#### 1. Exclude High-Frequency Components

```typescript
// @trace-disable
function HighFrequencyTimer() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(interval);
  }, []);

  return <div>{tick}</div>;
}
```

**Why:** Components that re-render on frequent timers or rapid user input create excessive console output.

#### 2. Use Opt-In Mode for Large Apps

```typescript
reactTracer.vite({
  mode: "opt-in", // Only trace marked components
});
```

```typescript
// Only trace components you're debugging
// @trace
function FeatureComponent() {
  const [state] = useState(0);
  return <div>{state}</div>;
}
```

> **Note:** `include`/`exclude` component filters are evaluated before pragma signals. `@trace` only operates within the eligible set.

**Benefit:** Substantially reduces output volume and DevTools load in large apps.

#### 3. Exclude Third-Party Components

```typescript
reactTracer.vite({
  include: {
    paths: ["src/**"],
  },
  exclude: {
    paths: ["**/node_modules/**", "**/lib/**", "**/vendor/**"],
  },
});
```

### Hook-Level Optimization

#### Limit Traced Hooks

```typescript
reactTracer.vite({
  labelHooksPattern: "^use(State|Effect|Reducer)$", // Only specific hooks
});
```

**Why:** Custom hooks and rarely-used hooks may not need tracing.

#### Reduce State Depth

```typescript
reactTracer({
  // Prefer interactive objects in DevTools to avoid deep stringification.
  outputMode: "devtools",

  // Cap traversal in extremely deep trees.
  maxFiberDepth: 80,
});
```

**Benefit:** Reduces work in very deep trees and avoids heavy stringification.

## FlowTracer Performance

### Function-Level Optimization

#### 1. Target Specific Functions

```javascript
// ✅ Good: Only event handlers and API calls
{
  "include": {
    "functions": ["handle*", "on*", "fetch*", "api*"]
  }
}

// ❌ Bad: All functions
{
  "include": {
    "functions": ["*"]
  }
}
```

**Impact:** Can materially reduce overhead by reducing the amount of traced work and logged output.

#### 2. Exclude Performance-Critical Code

```javascript
{
  "exclude": {
    "functions": ["render*", "update*", "draw*", "calculate*"]
  }
}
```

**Use cases:**

- Animation loops
- Canvas rendering
- Game loops
- Real-time data processing

#### 3. Avoid Tracing Utility Functions

```javascript
{
  "exclude": {
    "functions": ["get*", "set*", "is*", "has*", "_*"]
  }
}
```

**Why:** Utility functions are called frequently but rarely need debugging.

### Call Depth Management

#### Limit Exception Logging

```typescript
flowTracer({
  // If you don't need stack traces for exceptions, avoid injecting catch logging.
  // This reduces log volume and avoids capturing/logging Error.stack in hot paths.
  logExceptions: false,
});
```

**Impact:** Logging exceptions typically includes `Error.stack`, which can be expensive under heavy error rates.

#### Control Output Verbosity

```typescript
reactTracer({
  outputMode: "copy-paste", // Avoid console.group() overhead
});
```

**Why:** `console.group()` has higher overhead than `console.log()`.

## Build-Time Optimization

### Vite Configuration

#### 1. Minimize Plugin Processing

```typescript
flowTracer({
  include: {
    paths: ["src/**"], // Specific paths only
  },
});
```

#### 2. Exclude Test Files

```typescript
{
  "exclude": {
    "paths": ["**/*.test.*", "**/*.spec.*", "**/__tests__/**"]
  }
}
```

**Impact:** Can reduce build-time work by avoiding unnecessary transformations.

### Babel Configuration

#### 1. Conditional Plugin Loading

```javascript
// Only load plugins when needed
const plugins = process.env.YOUR_TRACING_FLAG
  ? [
      [
        "@autotracer/plugin-babel-flow",
        {
          /* config */
        },
      ],
    ]
  : [];

module.exports = {
  presets: ["next/babel"],
  plugins,
};
```

## Runtime Optimization

### Console Output Management

#### 1. Start Dormant Outside Dev

```typescript
async function initializeDormantFlowTracing(): Promise<void> {
  if (import.meta.env.DEV || import.meta.env.VITE_INTERNAL_QA === "true") {
    await import("@autotracer/flow/runtime");
  }
}

void initializeDormantFlowTracing();

// Tracing starts dormant; activate on demand:
// globalThis.autoTracer.flowTracer.start();
```

#### 2. Exclude Hot Paths

```typescript
// Prefer excluding performance-critical paths from instrumentation.
// Example (Vite):
//
// flowTracer({
//   exclude: { paths: ["src/hot-paths/**"] },
// });
```

**Note:** FlowTracer does not provide a generic `maxDepth` runtime option. If you need manual logging beside FlowTracer, use [@autotracer/logger](/api/logger) and project the specific fields you need before logging; the logger package does not export a generic depth-bounded helper.

### Memory Management

#### 1. Avoid Retaining Large Objects

```typescript
// ❌ Bad: Traces retain large objects
function processData(hugeDataset) {
  // hugeDataset logged and retained in console
  return hugeDataset.map(process);
}

// ✅ Good: Exclude the heavy function at build time
{
  exclude: {
    functions: ["processData"]
  }
}
```

## Real-World Scenarios

### Scenario 1: Large React Application

**Problem:** 500+ components, tracing slows app significantly.

**Solution:**

```typescript
// Use opt-in mode
reactTracer.vite({
  mode: "opt-in",
  include: {
    paths: ["src/features/problematic-feature/**"],
  },
});

// Only trace components being debugged
// @trace
function ProblematicComponent() {
  // ...
}
```

**Result:** Substantial reduction in tracing overhead.

### Scenario 2: Real-Time Dashboard

**Problem:** Dashboard updates 10 times/second, console flooded.

**Solution:**

```typescript
// Exclude high-frequency components
reactTracer.vite({
  mode: "opt-out",
  exclude: {
    paths: ["src/components/dashboard/**", "src/components/charts/**"],
  },
});
```

**Result:** Dramatic reduction in console spam; DevTools is much more likely to remain usable.

### Scenario 3: Complex Function Flow

**Problem:** Deeply nested function calls create performance bottleneck.

**Solution:**

```javascript
// Trace only top-level functions
{
  "include": {
    "functions": ["handle*", "process*"]
  },
  "exclude": {
    "functions": ["_*", "internal*", "helper*"]
  }
}
```

**Result:** Fewer traced functions and clearer output.

## Performance Checklist

### Development

- [ ] Tracing enabled only in development mode
- [ ] High-frequency components excluded
- [ ] Third-party libraries excluded
- [ ] Test files excluded from tracing
- [ ] Specific function patterns used (not `"*"`)

### Staging/QA

- [ ] Dormant mode enabled
- [ ] Manual activation only
- [ ] Narrow include/exclude filters
- [ ] Avoid exception logging in hot paths (if you don't need it)
- [ ] Opt-in mode for specific features

### Production

- [ ] Tracing completely disabled (recommended)
- [ ] Or dormant mode (logging starts off; activate briefly)
- [ ] No console output generated

## Benchmarks

Exact overhead numbers are highly app-dependent and can be misleading.

Use these qualitative guidelines instead:

- **Disabled:** No tracing output; no instrumentation work at runtime.
- **Dormant:** Instrumentation may be present, but logging starts off; overhead is usually low until you enable tracing.
- **Active (narrow scope):** Typically acceptable for short debugging sessions.
- **Active (broad scope / high frequency):** Can overwhelm DevTools and significantly slow your app.

## Best Practices Summary

### ✅ Do:

- Keep tracing out of publicly accessible builds
- Use dormant mode for restricted staging/QA environments
- Target specific functions/components
- Exclude high-frequency code
- Limit object serialization depth
- Use opt-in mode for large applications

### ❌ Don't:

- Trace every component/function without reason
- Enable tracing for animation loops
- Keep tracing active for high-frequency updates
- Use tracing in publicly accessible deployments

## Related Documentation

- [Security Considerations](/best-practices/security)
- [Production Deployment](/best-practices/production)
- [Configuration Reference - ReactTracer](/guide/config-react)
- [Configuration Reference - FlowTracer](/guide/config-flow)
- [Troubleshooting](/guide/troubleshooting)
