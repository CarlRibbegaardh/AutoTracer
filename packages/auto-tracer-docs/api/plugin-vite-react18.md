# @autotracer/plugin-vite-react18

**Vite plugin for automatic React component tracing.**

Build-time plugin that automatically injects `useReactTracer()` hooks into React components, enabling automatic state and prop labeling without manual instrumentation.

## Recommended Setup

Use `reactTracer.vite()` for build-time injection and gate `inject` so tracing is excluded from publicly accessible builds. Initialize `reactTracer()` before React renders only in the builds where tracing is present.

In restricted internal browser builds, use the [Dashboard workflow](/dashboard/webapps) as the normal browser control surface. When the dashboard is not available, use the lower-level runtime control surface on [`globalThis.autoTracer`](/api/react18#runtime-control-global-api).

## Installation

```bash
# Install runtime and plugin
pnpm add @autotracer/react18
pnpm add -D @autotracer/plugin-vite-react18

# Using npm
npm install @autotracer/react18
npm install --save-dev @autotracer/plugin-vite-react18

# Using yarn
yarn add @autotracer/react18
yarn add -D @autotracer/plugin-vite-react18
```

## Quick Start

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { reactTracer } from "@autotracer/plugin-vite-react18";

export default defineConfig(({ mode }) => ({
  plugins: [
    reactTracer.vite({
      inject: mode === "development",
    }),
    react(), // Place react() AFTER reactTracer
  ],
}));
```

Initialize `reactTracer()` separately in your app entry file before React renders. For the recommended Vite entry path, see [ReactTracer Installation - Vite](/guide/installation-react-vite) and [ReactTracer Configuration](/guide/config-react).

## API Reference

### `reactTracer.vite(options)`

Create Vite plugin instance.

**Type Signature:**

```typescript
function vite(options?: ReactTracerOptions): Plugin;
```

**Parameters:**

- `options` - Optional configuration object

**Returns:**

Vite plugin object

### `ReactTracerOptions`

`ReactTracerOptions` is the configuration object passed to `reactTracer.vite()`.

Plugin settings are documented in the Build Settings section as one page per option. Start with [ReactTracer Vite Plugin Settings](/reference/build/react18/vite/). Common entries include [`inject`](/reference/build/react18/vite/config/inject), [`mode`](/reference/build/react18/vite/config/mode), [`include`](/reference/build/react18/vite/config/include), [`exclude`](/reference/build/react18/vite/config/exclude), [`dashboardConfig`](/reference/build/react18/vite/config/dashboardConfig), [`outputMode`](/reference/build/react18/vite/config/outputMode), [`buildWithWorkspaceLibs`](/reference/build/react18/vite/config/buildWithWorkspaceLibs), and [`prefix`](/reference/build/react18/vite/config/prefix).

## Automatic Theme Files

When `inject` is enabled, the Vite plugin loads ReactTracer theme files from the project root at build time and injects the merged result into `globalThis.__REACTTRACER_THEME__` before your app runs.

Put these files directly in the Vite root folder that the plugin builds from. In a typical app, that is the same folder as `vite.config.ts` and `package.json`, not `src/` or a nested config folder.

Theme file search order:

- `*react-theme.json`
- `*react-theme-light.json`
- `*react-theme-dark.json`

If multiple files match one step, the first alphabetical match wins for that step.

At runtime, ReactTracer selects the `lightMode` or `darkMode` branch from that merged theme using your browser's [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme) preference.

If you also pass [`colors`](/reference/runtime/react18/config/colors) to `reactTracer()`, ReactTracer applies the built-in theme first, then your programmatic project defaults, and finally the injected theme files as local overrides.

For the full category reference and repository examples, see [ReactTracer Theme API](/themes/react18/api) and [ReactTracer Example Themes](/themes/react18/examples).

## Configuration

Plugin settings are grouped by concern in [ReactTracer Vite Plugin Settings](/reference/build/react18/vite/).

- Startup and browser control: [`inject`](/reference/build/react18/vite/config/inject), [`dashboardConfig`](/reference/build/react18/vite/config/dashboardConfig), and [`outputMode`](/reference/build/react18/vite/config/outputMode)
- Eligibility and labeling: [`mode`](/reference/build/react18/vite/config/mode), [pragma comments](/reference/build/react18/vite/pragmas), [`include`](/reference/build/react18/vite/config/include), [`exclude`](/reference/build/react18/vite/config/exclude), [`labelHooks`](/reference/build/react18/vite/config/labelHooks), [`labelHooksPattern`](/reference/build/react18/vite/config/labelHooksPattern), and [`prefix`](/reference/build/react18/vite/config/prefix)
- Framework and build wiring: [`serverComponents`](/reference/build/react18/vite/config/serverComponents), [`importSource`](/reference/build/react18/vite/config/importSource), [`buildWithWorkspaceLibs`](/reference/build/react18/vite/config/buildWithWorkspaceLibs), [`reactUmdSrc`](/reference/build/react18/vite/config/reactUmdSrc), and [`reactDomUmdSrc`](/reference/build/react18/vite/config/reactDomUmdSrc)

## Pragmas

Use line comments to control component-level injection.

- `// @trace` enables one eligible component.
- `// @trace-disable` disables one eligible component.
- `include` and `exclude` decide the eligible set before pragma signals are applied.

For exact placement rules, precedence, and examples, see [ReactTracer Vite pragma comments](/reference/build/react18/vite/pragmas).

## Features

### Automatic Hook Injection

Injects `useReactTracer()` at the start of function components:

```typescript
// Original
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// Transformed
import { useReactTracer } from '@autotracer/react18';

function Counter() {
  useReactTracer();
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Variable Name Extraction

Extracts state/prop variable names for readable traces:

```typescript
const [user, setUser] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const { data } = useQuery("todos");

// Traced as: "user", "isLoading", "data"
```

### Build-time Only

All transformations happen during build; the plugin does not run at runtime.

## Integration

### With React

Place `reactTracer.vite()` **before** `@vitejs/plugin-react`:

```typescript
export default defineConfig({
  plugins: [
    reactTracer.vite(),
    react(), // Must come after reactTracer
  ],
});
```

### With Next.js

For Next.js, use [@autotracer/plugin-babel-react18](./plugin-babel-react18) instead.

### With React Server Components

Enable `serverComponents` mode:

```typescript
reactTracer.vite({
  serverComponents: true,
  include: { paths: ["app/**/*.tsx"] },
});
```

## Requirements

- Vite 4+
- React 18+
- TypeScript/JavaScript with JSX
- Node.js 18+

## Performance

- **No plugin runtime logic** - All transformation happens at build time
- **Fast HMR** - Vite's instant hot module replacement
- **Selective targeting** - Only transforms matched files
- **Public-build safety** - Disable with `inject: false` in publicly accessible builds

When tracing is enabled, runtime overhead comes from the injected tracing hooks and the volume of console output/DevTools rendering.

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type { ReactTracerOptions } from "@autotracer/plugin-vite-react18";

const options: ReactTracerOptions = {
  include: { paths: ["src/**/*.tsx"] },
};
```

## Examples

### Development Only

```typescript
export default defineConfig(({ mode }) => ({
  plugins: [
    reactTracer.vite({
      inject: mode === "development",
    }),
    react(),
  ],
}));
```

### Opt-in Mode

```typescript
reactTracer.vite({
  mode: "opt-in",
  include: { paths: ["src/components/**/*.tsx"] },
});
```

### Custom Patterns

```typescript
reactTracer.vite({
  include: { paths: ["src/**/*.tsx"] },
  exclude: {
    paths: ["**/*.test.*", "**/*.spec.*", "**/*.stories.*", "src/legacy/**"],
  },
});
```

### Next.js App Router (with Server Components)

```typescript
reactTracer.vite({
  serverComponents: true,
  include: { paths: ["app/**/*.tsx"] },
});
```

### Environment-controlled

```typescript
reactTracer.vite({
  inject: process.env.ENABLE_TRACING === "1",
});
```

## Troubleshooting

### Plugin Order

Always place `reactTracer.vite()` **before** `react()`:

```typescript
// ✅ Correct
plugins: [reactTracer.vite(), react()];

// ❌ Wrong
plugins: [react(), reactTracer.vite()];
```

### Not Injecting

Check:

1. `inject` option is `true`
2. File matches `include` pattern
3. File doesn't match `exclude` pattern
4. No `@trace-disable` pragma on component
5. `TRACE_INJECT` environment variable not set to `0`

### Server Components

Enable `serverComponents` mode and ensure client components have `"use client"` directive:

```typescript
'use client';

// This component will be traced
export function ClientComponent() {
  const [state] = useState(0);
  return <div>{state}</div>;
}
```

## Related Packages

- [@autotracer/react18](./react18) - Runtime library (required)
- [@autotracer/plugin-babel-react18](./plugin-babel-react18) - Babel plugin for Next.js/CRA
- [@autotracer/logger](./logger) - Internal shared logger utility used by `@autotracer/react18`

## See Also

- [Quick Start Guide](/guide/quickstart-react)
- [Installation Guide](/guide/installation-react-vite)
- [Configuration Reference](/guide/config-react)
- [ReactTracer Vite Plugin Settings](/reference/build/react18/vite/)
- [Troubleshooting](/guide/troubleshooting)
