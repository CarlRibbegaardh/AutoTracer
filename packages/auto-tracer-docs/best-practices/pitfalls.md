# Common Pitfalls

Common mistakes when using AutoTracer and how to avoid them.

## Overview

This guide covers frequent issues developers encounter when implementing AutoTracer, along with solutions and preventive measures.

## ReactTracer Pitfalls

### 1. Forgetting to Initialize ReactTracer

**Problem:**

```typescript
// ❌ Component traced but tracer not initialized
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// No output in console!
```

**Solution:**

```typescript
// pages/_app.tsx or main.tsx
async function bootstrap(): Promise<void> {
  const { reactTracer } = await import("@autotracer/react18");

  reactTracer({ enabled: true }); // Initialize first!

  await import("./app");
}

void bootstrap();

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
```

**Prevention:** Always initialize tracers in your app's entry point before React renders.

### 2. Missing React DevTools Hook

**Problem:**

```
Error: React DevTools global hook not found
```

**Solution:**

Install React DevTools browser extension OR add DevTools hook shim:

```typescript
// pages/_document.tsx (Next.js)
<script
  dangerouslySetInnerHTML={{
    __html: `
(function() {
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) return;
  var nextID = 0;
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    renderers: new Map(),
    supportsFiber: true,
    inject: function(injected) { return nextID++; },
    onScheduleFiberRoot: function() {},
    onCommitFiberRoot: function() {},
    onCommitFiberUnmount: function() {}
  };
})();
    `,
  }}
/>
```

**Prevention:** In development, Next.js Fast Refresh provides the hook automatically. For production, use the browser extension.

### 3. Plugin Order Issues (Vite)

**Problem:**

```typescript
// ❌ Wrong order
export default defineConfig({
  plugins: [
    react(), // React plugin first
    reactTracer.vite(), // Tracer plugin second - TOO LATE!
  ],
});
```

**Solution:**

```typescript
// ✅ Correct order
export default defineConfig({
  plugins: [
    reactTracer.vite(), // Tracer plugin FIRST
    react(), // React plugin second
  ],
});
```

**Prevention:** Always place `reactTracer.vite()` **before** `react()` in the plugins array.

### 4. Tracing Server Components (Next.js App Router)

**Problem:**

```typescript
// app/server-component.tsx
// NO "use client" directive

export function ServerComponent() {
  // This shouldn't be traced but is being transformed
  return <div>Server content</div>;
}
```

**Solution:**

```javascript
// babel.config.js
{
  "plugins": [
    [
      "@autotracer/plugin-babel-react18",
      {
        "serverComponents": true  // Enable this!
      }
    ]
  ]
}
```

**Prevention:** Set `serverComponents: true` when using Next.js App Router.

### 5. High-Frequency Component Flooding Console

**Problem:**

```typescript
// ❌ Component updates 60 times/second
function AnimationFrame() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setFrame(frame + 1));
    return () => cancelAnimationFrame(id);
  });

  return <div>{frame}</div>;
}

// Console flooded with thousands of traces!
```

**Solution:**

```typescript
// ✅ Disable tracing for this component
// @trace-disable
function AnimationFrame() {
  const [frame, setFrame] = useState(0);
  // No tracing overhead
}
```

**Prevention:** Use `@trace-disable` pragma for high-frequency components (animation, timers, frequent updates).

### 6. Forgetting `labelState()` for Prop Changes

**Problem:**

```typescript
// Props change but not traced
function UserCard({ user }) {
  return <div>{user.name}</div>;
}

// No output when user prop changes
```

**Solution:**

```typescript
import { useReactTracer, labelState } from "@autotracer/react18";

function UserCard({ user }) {
  useReactTracer();
  labelState({ user }, "UserCard"); // Label props explicitly

  return <div>{user.name}</div>;
}
```

**Prevention:** Build plugins automatically add `labelState()` for props. If manually instrumenting, don't forget props.

## FlowTracer Pitfalls

### 1. Forgetting Runtime Import

**Problem:**

```typescript
// ❌ Plugin configured but runtime not imported
// babel.config.js has @autotracer/plugin-babel-flow

// app.tsx
function App() {
  processData(); // Not traced!
}

// No output in console
```

**Solution:**

```typescript
// ✅ Initialize the intended Flow runtime entry before the app loads
async function bootstrap(): Promise<void> {
  await import("@autotracer/flow");

  await import("./app");
}

void bootstrap();

function App() {
  processData(); // Now traced!
}
```

**Prevention:** Always import the intended Flow runtime entry in your app's entry point. Use `@autotracer/flow` for immediate startup. Use `@autotracer/flow/runtime` for dormant startup and later browser control.

### 2. Tracing Everything (`"*"` Pattern)

**Problem:**

```javascript
// ❌ Traces ALL functions - massive overhead
{
  "include": {
    "functions": ["*"]  // Thousands of functions traced!
  }
}

// Console flooded, app slow
```

**Solution:**

```javascript
// ✅ Use specific patterns
{
  "include": {
    "functions": ["handle*", "on*", "fetch*", "process*"]
  }
}

// Only relevant functions traced
```

**Prevention:** Start with specific patterns. Add more as needed.

### 3. Path Pattern Mistakes

**Problem:**

```javascript
// ❌ Wrong pattern - misses files
{
  "include": {
    "paths": ["src/*"]  // Only matches direct children, not nested
  }
}
```

**Solution:**

```javascript
// ✅ Correct pattern - matches all nested files
{
  "include": {
    "paths": ["src/**"]  // Matches src/ and all subdirectories
  }
}
```

**Prevention:** Use `**` for recursive matching, `*` for single-level matching.

### 4. Circular Reference in Logged Objects

**Problem:**

```javascript
// Object with circular reference
const obj = { self: null };
obj.self = obj;

function process(data) {
  // Recursive serializers and ad-hoc debug formatting can break on cyclic data.
  return data;
}

process(obj);
// Any naive recursive serializer can fail here.
```

**Solution:**

AutoTracer does not expose a public `serializeObject(...)` helper. If you need manual inspection here, project the value to the few fields you actually need before logging it, and use [@autotracer/logger](/api/logger) only for the logging path itself.

**Prevention:** Avoid logging huge nested objects in hot paths, and avoid enabling FlowTracer param/return logging for large values.

### 5. Not Using Dormant Mode in Restricted Test/QA Deployments

**Problem:**

```typescript
// ❌ Active tracing in a deployed QA environment
await import("@autotracer/flow"); // Always logging by default

// Performance overhead, console clutter
```

**Solution:**

```typescript
// ✅ Use dormant mode
await import("@autotracer/flow/runtime");

// In browser-based internal web apps, start tracing from the Dashboard when it is mounted.
// In non-Dashboard setups, activate when needed:
globalThis.autoTracer.flowTracer.start();
```

**Prevention:** Use `@autotracer/flow/runtime` for restricted staging and QA deployments when tracing should stay dormant until you activate it. In browser-based internal web apps, use the Dashboard as the normal control surface when that workflow is mounted.

## Configuration Pitfalls

### 1. Babel Config Not Loading (Next.js)

**Problem:**

```javascript
// .babelrc
{
  "plugins": ["@autotracer/plugin-babel-react18"]
}

// Config not applied in Next.js!
```

**Solution:**

```javascript
// Use babel.config.js instead
module.exports = {
  presets: ["next/babel"],
  plugins: ["@autotracer/plugin-babel-react18"],
};
```

**Prevention:** Next.js requires `babel.config.js`, not `.babelrc`.

### 2. Missing Peer Dependencies

**Problem:**

```bash
# Install plugin but not runtime
pnpm add -D @autotracer/plugin-vite-flow @babel/core @babel/preset-typescript

# Error: Cannot find module '@autotracer/flow'
```

**Solution:**

```bash
# Install runtime plus the plugin peer dependencies
pnpm add @autotracer/flow
pnpm add -D @autotracer/plugin-vite-flow @babel/core @babel/preset-typescript
```

**Prevention:** Install `@autotracer/flow` plus the Vite plugin peer dependencies. `@autotracer/logger` is installed automatically with `@autotracer/flow`.

### 3. Environment Variable Name Mismatch

**Problem:**

```typescript
// .env
ENABLE_TRACING = true;

// App checks a different variable (never matches)
if (process.env.ENABLE_AUTOTRACER !== "true") {
  // Never runs
}
```

**Solution:**

Make the variable name consistent, and evaluate it in the right place:

- Prefer reading flags in **build configuration** (e.g. `vite.config.ts`, `babel.config.js`) and passing booleans into plugin options.
- Avoid relying on client-exposed env vars unless you intentionally want the value in the browser bundle.

**Prevention:** Treat tracing enablement as a build-time concern (instrumentation on/off), and treat dormant mode as a runtime concern. In browser-based internal web apps, use the Dashboard when that workflow is mounted. In non-Dashboard setups, use `globalThis.autoTracer.flowTracer.start()` / `globalThis.autoTracer.flowTracer.stop()`.

### 4. TypeScript Config Excluding Plugin Files

**Problem:**

```json
// tsconfig.json
{
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.config.*"] // Excludes vite.config.ts!
}

// TypeScript errors in vite.config.ts
```

**Solution:**

```json
{
  "include": ["src/**/*", "*.config.ts"],
  "exclude": ["node_modules"]
}
```

**Prevention:** Ensure config files included in TypeScript compilation.

## Build and Performance Pitfalls

### 1. Not Disabling in Production

**Problem:**

```typescript
// ❌ Tracing enabled in production build
export default defineConfig({
  plugins: [
    reactTracer.vite({ inject: true }), // Always enabled!
  ],
});
```

**Solution:**

```typescript
// ✅ Conditional based on mode
export default defineConfig(({ mode }) => ({
  plugins: [reactTracer.vite({ inject: mode === "development" })],
}));
```

**Prevention:** Use `mode` or environment variables to control injection.

### 2. Large Bundle Size

**Problem:**

```bash
# Bundle analysis shows large tracing libraries in production
@autotracer/react18: 45 KB
@autotracer/flow: 38 KB
```

**Solution:**

```typescript
// Dynamic import (dev only)
if (process.env.NODE_ENV === "development") {
  const { reactTracer } = await import("@autotracer/react18");
  reactTracer({ enabled: true });
}
```

**Prevention:** Use conditional imports or disable plugins in production builds.

### 3. Slow Build Times

**Problem:**

```bash
# Build takes 2x longer with tracing plugins
pnpm build  # 120s instead of 60s
```

**Solution:**

```javascript
// Limit transformation scope
{
  "include": {
    "paths": ["src/features/debug-feature/**"]  // Not src/**
  }
}
```

**Prevention:** Use specific include patterns to reduce files processed.

### 4. Using `buildWithWorkspaceLibs` for Source Libraries

**Problem:**

A monorepo has a source-only workspace library (TypeScript, no `dist/`). The developer enables `buildWithWorkspaceLibs: true` to fix a Rollup resolution error:

```typescript
// ❌ Wrong tool for source libs
reactTracer.vite({
  inject: mode === "development",
  buildWithWorkspaceLibs: true, // Overkill — removes React from bundle!
});
```

This externalisess React from the **entire app bundle** and replaces it with a UMD global loaded from `unpkg.com`. The app now breaks if the CDN is unreachable, the CSP blocks it, or the network is slow.

**Solution:**

Use `resolve.alias` instead — it redirects the import at resolution time and has zero runtime side-effects:

```typescript
// ✅ Correct tool for source libs
import { resolve } from "path";

reactTracer.vite({
  inject: mode === "development",
  // no buildWithWorkspaceLibs
});

// in defineConfig:
resolve: {
  alias: {
    "@autotracer/react18": resolve(
      __dirname,
      "../../node_modules/@autotracer/react18",
    ),
  },
},
```

React stays in your normal bundle. No CDN dependency. No CSP risk.

**When to use `buildWithWorkspaceLibs`:** Only when the workspace library is a **pre-built package** (it has its own `dist/`) and `@autotracer/react18` is already externalised from that `dist/`.

**Prevention:** See [Monorepo Setup](/guide/monorepo) for the full decision tree.

## Runtime Pitfalls

### 1. Hydration Mismatch (Next.js)

**Problem:**

```typescript
// ❌ Tracer initialized during render
function App({ Component }) {
  reactTracer(); // Causes hydration error!
  return <Component />;
}
```

**Solution:**

```typescript
// ✅ Initialize in useEffect
function App({ Component }) {
  useEffect(() => {
    reactTracer({ enabled: true }); // After hydration
  }, []);
  return <Component />;
}
```

**Prevention:** Initialize tracers in `useEffect` or outside component render.

### 2. Memory Leaks from Console Output

**Problem:**

```javascript
// Console retains all logged objects
function processLargeData() {
  const hugeArray = new Array(1000000);
  // FlowTracer logs hugeArray - held in memory!
  return hugeArray.map(process);
}

// After many calls, memory usage explodes
```

**Solution:**

```javascript
// Exclude memory-intensive functions
{
  "exclude": {
    "functions": ["processLargeData", "*Batch", "*Bulk"]
  }
}

// Or clear console periodically
setInterval(() => console.clear(), 60000);
```

**Prevention:** Exclude functions handling large data structures.

### 3. Tracer Initialization Order

**Problem:**

```typescript
// ❌ Wrong order
import { useReactTracer } from "@autotracer/react18";

function Component() {
  useReactTracer();
  const [state] = useState(0);
  return <div>{state}</div>;
}

// No output for state!
```

**Solution:**

Build plugins automatically inject `useReactTracer()` **before** hooks. Manual instrumentation must follow same order:

```typescript
// ✅ Correct order (done automatically by plugins)
function Component() {
  useReactTracer(); // FIRST
  const [state] = useState(0); // Then hooks
  return <div>{state}</div>;
}
```

**Prevention:** Use build plugins for automatic correct injection.

## Integration Pitfalls

### 1. Mixing Vite and Babel Plugins

**Problem:**

```typescript
// vite.config.ts with Vite plugin
plugins: [reactTracer.vite()];

// babel.config.js also has Babel plugin
plugins: ["@autotracer/plugin-babel-react18"];

// Both plugins applied - double instrumentation!
```

**Solution:**

Use **either** Vite plugin **or** Babel plugin, not both.

**Prevention:**

- **Vite projects:** Use `@autotracer/plugin-vite-*`
- **Next.js/CRA:** Use `@autotracer/plugin-babel-*`

### 2. Conflicting ESLint Rules

**Problem:**

```typescript
// ESLint error: React Hook "useReactTracer" is called in function "Component"
// that is neither a React function component nor a custom React Hook function
```

**Solution:**

```json
// .eslintrc.json
{
  "rules": {
    "react-hooks/rules-of-hooks": [
      "error",
      {
        "additionalHooks": "useReactTracer"
      }
    ]
  }
}
```

**Prevention:** Configure ESLint to recognize `useReactTracer` as a hook.

## Checklist: Avoiding Common Pitfalls

### Setup

- [ ] Tracers initialized in app entry point
- [ ] React DevTools hook available (extension or shim)
- [ ] Build plugins in correct order
- [ ] Runtime packages imported
- [ ] Peer dependencies installed

### Configuration

- [ ] Specific function/path patterns (not `"*"`)
- [ ] `serverComponents: true` for Next.js App Router
- [ ] Environment-specific settings
- [ ] Exclude test files
- [ ] Disable in production builds

### Performance

- [ ] High-frequency components excluded
- [ ] Dormant mode for staging/production
- [ ] Bundle size checked
- [ ] Memory-intensive functions excluded
- [ ] Console cleared periodically if needed
- [ ] Monorepo source libs use `resolve.alias`, not `buildWithWorkspaceLibs`

### Integration

- [ ] Only one plugin type (Vite OR Babel, not both)
- [ ] ESLint configured for `useReactTracer`
- [ ] TypeScript config includes config files
- [ ] Environment variable naming correct

## Related Documentation

- [Troubleshooting Guide](/guide/troubleshooting) - Detailed problem solving
- [Performance Optimization](/best-practices/performance) - Performance tips
- [Security Considerations](/best-practices/security) - Security best practices
- [Production Deployment](/best-practices/production) - Production strategies
