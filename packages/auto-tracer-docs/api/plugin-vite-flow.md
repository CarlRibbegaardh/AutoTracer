# @autotracer/plugin-vite-flow

**Vite plugin for function flow tracing with dormant mode.**

Build-time plugin that instruments functions to track entry, exit, parameters, return values, and exceptions. Integrates with Vite and can start FlowTracer for you in browser apps.

## Recommended Setup

Use `@autotracer/plugin-vite-flow` for build-time instrumentation and decide whether the plugin is active with `inject`.

Leave `runtimeControlled` at its default `true` when you want dormant startup. Provide [`dashboardConfig`](/reference/build/flow/vite/config/dashboardConfig) when you want the standard dashboard control workflow on the Vite path.

If you add @autotracer/\* imports outside the plugin, gate those imports with the same build condition.

For browser-based targeted runtime control, use the [Dashboard workflow](/dashboard/webapps).

When the dashboard is not available, use the lower-level commands in [@autotracer/flow](./flow).

## Installation

```bash
# Install runtime and plugin
pnpm add @autotracer/flow
pnpm add -D @autotracer/plugin-vite-flow @babel/core @babel/preset-typescript

# Using npm
npm install @autotracer/flow
npm install --save-dev @autotracer/plugin-vite-flow @babel/core @babel/preset-typescript

# Using yarn
yarn add @autotracer/flow
yarn add -D @autotracer/plugin-vite-flow @babel/core @babel/preset-typescript
```

**Note:** `@autotracer/logger` installs automatically with `@autotracer/flow`. `@babel/core` and `@babel/preset-typescript` are peer dependencies required for code transformation.

**For pnpm users:** Add to `.npmrc`:

```ini
# .npmrc
auto-install-peers=true
```

## Entry Point

Import this package from its root entry:

```typescript
import { flowTracer } from "@autotracer/plugin-vite-flow";
```

The same root entry also exports the `FlowTracerViteOptions` TypeScript type.

## Quick Start

### Dormant Mode (Recommended)

Tracing is instrumented but disabled until activated later:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { flowTracer } from "@autotracer/plugin-vite-flow";

export default defineConfig(({ mode }) => {
  const enableTracing = mode === "development";

  return {
    plugins: [
      flowTracer({
        inject: enableTracing,
        runtimeControlled: true, // Start dormant (explicit; also the default)
        dashboardConfig: {},
        include: {
          paths: ["**/src/**"],
          functions: ["handle*", "on*", "process*"],
        },
      }),
    ],
  };
});
```

In browser apps, prefer the dashboard for targeted control. For lower-level start, stop, and status commands, see [@autotracer/flow](./flow).

### Always-On Mode

Tracing starts immediately:

```typescript
const enableTracing = process.env.INTERNAL_QA === "true";

flowTracer({
  inject: enableTracing,
  runtimeControlled: false,
  include: {
    paths: ["**/src/**"],
    functions: ["*"], // Trace all functions
  },
});
```

## API Reference

### `flowTracer(options)`

Create Vite plugin instance.

**Type Signature:**

```typescript
function flowTracer(options?: FlowTracerViteOptions): Plugin;
```

**Parameters:**

- `options` - Optional configuration object

**Returns:**

Vite plugin object

### `FlowTracerViteOptions`

Configuration interface for the Vite plugin.

```typescript
interface FlowTracerViteOptions {
  /**
   * Enable or disable code injection
   * @default true
   */
  inject?: boolean;

  /**
   * Runtime-controlled activation (dormant mode)
   * When true, tracing stays off until it is started at runtime
   * @default true
   */
  runtimeControlled?: boolean;

  /**
   * Dashboard widget configuration for browser runtime control.
   * @default undefined
   */
  dashboardConfig?: {
    enabled?: boolean;
    hideByDefault?: boolean;
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    hotkeys?: {
      toggleTracing?: string;
      toggleDashboard?: string;
    };
  };

  /**
   * Include exception logging in catch blocks
   * @default true
   */
  logExceptions?: boolean;

  /**
   * Log level for exception logging
   * @default 'debug'
   */
  exceptionLogLevel?: "debug" | "warn" | "error";

  /**
   * Name of global tracer instance variable
   * @default '__flowTracer'
   */
  tracerName?: string;

  /**
   * Include configuration
   */
  include?: {
    /**
     * File path patterns (glob patterns)
     * @default ["**/*.{js,jsx,mjs,ts,tsx,mts}"]
     */
    paths?: string[];

    /**
     * Function name patterns (glob, regex, or exact strings)
     * @default [] (all functions included)
     */
    functions?: Array<string | RegExp>;
  };

  /**
   * Exclude configuration
   */
  exclude?: {
    /**
     * File path patterns (glob patterns)
     * @default ["**/*.test.*", "**/*.spec.*", "**/node_modules/**", "**/dist/**", "**/build/**", "**/.next/**", "**/coverage/**", "**/tests/**", "**/test/**", "**/__tests__/**"]
     */
    paths?: string[];

    /**
     * Function name patterns (glob, regex, or exact strings)
     * @default []
     */
    functions?: Array<string | RegExp>;
  };

  /**
   * Prefix prepended to every logged function name.
   *
   * Useful in islands or micro-frontend architectures where multiple independent
   * bundles share the same DevTools console, making it clear which app a log belongs to.
   *
   * Example: `prefix: "Island1"` logs `"Island1:processData"` instead of `"processData"`.
   *
   * **Filtering is not affected** — `include`/`exclude` patterns always match against
   * the original, un-prefixed function name.
   *
  * **Runtime start/stop is not affected** — the lower-level runtime commands
  * are global on/off switches; the prefix is a build-time label with no runtime
   * routing or gating effect.
   */
  prefix?: string;

  /**
   * Instrumentation mode.
   * - 'opt-in': Only instrument when `@trace` pragma is present on an eligible function
   * - 'opt-out': Instrument all eligible functions unless `@trace-disable` is present
   * @default 'opt-out'
   */
  mode?: "opt-in" | "opt-out";
}
```

Use [FlowTracer Vite settings](/reference/build/flow/vite/) for exact per-option behavior and examples. For the browser control path specifically, start with [`runtimeControlled`](/reference/build/flow/vite/config/runtimeControlled), [`dashboardConfig`](/reference/build/flow/vite/config/dashboardConfig), and the [Dashboard Package Reference](/dashboard/reference).

## Pragmas

Use line comments to control function-level instrumentation.

- `// @trace` enables one eligible function.
- `// @trace-disable` disables one eligible function.
- `include` and `exclude` decide the eligible set before pragma signals are applied.

For exact placement rules, precedence, nested-function behavior, and examples, see [Flow pragma comments](/reference/build/flow/vite/pragmas).

## Automatic Theme Files

When `inject` is `true`, the Vite plugin loads FlowTracer theme files from the project root and makes them available to FlowTracer at startup.

Put these files directly in the Vite root folder that the plugin builds from. In a typical app, that is the same folder as `vite.config.ts` and `package.json`, not `src/` or a nested config folder.

Theme file search order:

- `*flow-theme.json`
- `*flow-theme-light.json`
- `*flow-theme-dark.json`

If multiple files match one step, the first alphabetical match wins for that step.

At runtime, FlowTracer selects the `lightMode` or `darkMode` branch from that merged theme using your browser's [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme) preference.

FlowTracer merges the loaded theme files over `DEFAULT_FLOW_THEME`.

For the full category reference and repository examples, see [FlowTracer Theme API](/themes/flow/api) and [FlowTracer Example Themes](/themes/flow/examples).

## Configuration

### `inject`

Enable or disable code injection.

```typescript
// Development only
flowTracer({
  inject: import.meta.env.DEV,
});

// Environment variable control
flowTracer({
  inject: process.env.ENABLE_FLOW_TRACING === "1",
});
```

### `runtimeControlled`

Dormant mode control.

```typescript
// Dormant mode: Instrumented but disabled until activated
flowTracer({
  runtimeControlled: true,
});

// Always-on mode: Tracing starts immediately
flowTracer({
  runtimeControlled: false,
});
```

`runtimeControlled` defaults to `true`. Pass `false` explicitly when you want tracing to start active.

For browser-based setups, pair `runtimeControlled: true` with `dashboardConfig` and use the dashboard as the primary control surface.

For lower-level start, stop, and status commands, see [@autotracer/flow](./flow).

### `dashboardConfig`

`dashboardConfig` is the plugin-owned build setting for automatic dashboard mounting on the Vite browser path.

Use it together with `runtimeControlled: true` when you want dormant browser startup plus the standard dashboard control surface.

The plugin only applies `dashboardConfig` when `inject` is enabled.

For exact field behavior, including the current `enabled` caveat, use [Flow Vite `dashboardConfig`](/reference/build/flow/vite/config/dashboardConfig). For manual mounting, widget controls, and package-side dashboard settings, use [Dashboard Package Reference](/dashboard/reference).

### `include` / `exclude`

Selective function instrumentation.

By default, the plugin includes `"**/*.{js,jsx,mjs,ts,tsx,mts}"`, excludes common noise paths such as tests, build outputs, coverage folders, and dependency folders, and applies no function-name filters.

Partial `include` and `exclude` objects use object-key merge. Each key you provide replaces the default for that key only. Arrays are never concatenated.

```typescript
flowTracer({
  include: {
    paths: ["**/src/**", "**/app/**"],
    functions: ["calculate*", "process*", "handle*", "fetch*"],
  },
  exclude: {
    functions: ["helper*", "internal*", "_*"],
  },
});
```

This keeps the default path exclusions while adding function-name exclusions.

**Pattern Examples:**

- `'*'` - All
- `'handle*'` - Starts with "handle"
- `'*Handler'` - Ends with "Handler"
- `'*process*'` - Contains "process"
- `['on*', 'handle*']` - Multiple patterns

## Features

### Automatic Function Instrumentation

Wraps functions with tracing code at build time:

```typescript
// Original
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Instrumented (simplified)
function calculateTotal(items) {
  logEntry("calculateTotal", { items });
  try {
    const result = items.reduce((sum, item) => sum + item.price, 0);
    logExit("calculateTotal", result);
    return result;
  } catch (error) {
    logException("calculateTotal", error);
    throw error;
  }
}
```

### Exception Logging

Tracks exceptions without breaking existing error handling:

```typescript
// Original with try/catch
function riskyOperation() {
  try {
    return dangerousCall();
  } catch (error) {
    console.error("Failed:", error);
    throw error;
  }
}

// Instrumented (preserves original catch)
function riskyOperation() {
  logEntry("riskyOperation", {});
  try {
    const result = dangerousCall();
    logExit("riskyOperation", result);
    return result;
  } catch (error) {
    logException("riskyOperation", error);
    console.error("Failed:", error);
    throw error;
  }
}
```

### Async Function Support

Handles promises and async/await automatically:

```typescript
// Original
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// Example output format:
// → fetchUser (async started)
// param id: "123"
// returned: Promise
// ← fetchUser (async completed, elapsed: 12.3ms)
```

### Dormant Mode

No trace output until activated:

```typescript
flowTracer({
  runtimeControlled: true,
});
```

Use the Dashboard for browser-based control. For lower-level runtime commands, see [@autotracer/flow](./flow).

**Perfect for:** QA/staging environments where you want tracing available but not always running.

### Automatic Runtime Start

No manual runtime import needed in dormant mode:

```typescript
// Your code - no imports!
function myFunction() {
  return "result";
}

// The plugin starts FlowTracer automatically
```

## Integration

### With Vite

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { flowTracer } from "@autotracer/plugin-vite-flow";

export default defineConfig(({ mode }) => ({
  plugins: [
    flowTracer({
      inject: mode === "development",
      runtimeControlled: true,
      include: {
        paths: ["src/**"],
        functions: ["*"],
      },
    }),
  ],
}));
```

### With React

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { flowTracer } from "@autotracer/plugin-vite-flow";

export default defineConfig({
  plugins: [
    flowTracer({
      include: {
        paths: ["src/**"],
        functions: ["handle*", "on*"],
      },
    }),
    react(),
  ],
});
```

### With Vue

```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { flowTracer } from "@autotracer/plugin-vite-flow";

export default defineConfig({
  plugins: [
    flowTracer({
      include: {
        paths: ["src/**"],
        functions: ["*"],
      },
    }),
    vue(),
  ],
});
```

### Monorepo / Workspace

Add Vite aliases for local packages:

```typescript
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@autotracer/flow/runtime": path.resolve(
        __dirname,
        "../../packages/auto-tracer-flow/dist/runtime.js",
      ),
      "@autotracer/flow": path.resolve(
        __dirname,
        "../../packages/auto-tracer-flow",
      ),
      "@autotracer/logger": path.resolve(
        __dirname,
        "../../packages/auto-tracer-logger",
      ),
    },
  },
  plugins: [
    flowTracer({
      /* ... */
    }),
  ],
});
```

**Important:** `/runtime` alias must come **before** base `@autotracer/flow` alias.

## Requirements

- Vite 4+
- Node.js 18+
- Modern browser with ES2020+ support
- @babel/core and @babel/preset-typescript (peer dependencies)

## Performance

- **Dormant mode:** Logging starts off; overhead is typically low until you activate tracing.
- **Build-time transformation** - All instrumentation during build
- **Selective targeting** - Only instruments matched functions
- **Fast HMR** - Vite's instant hot module replacement preserved

When tracing is active, overhead is often dominated by console output volume and DevTools rendering.

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type { FlowTracerViteOptions } from "@autotracer/plugin-vite-flow";

const enableTracing = process.env.INTERNAL_QA === "true";

const options: FlowTracerViteOptions = {
  inject: enableTracing,
  runtimeControlled: true,
  include: {
    paths: ["src/**"],
    functions: ["handle*"],
  },
};
```

## Examples

### Development Only

```typescript
export default defineConfig(({ mode }) => ({
  plugins: [
    flowTracer({
      inject: mode === "development",
      runtimeControlled: true,
    }),
  ],
}));
```

### Selective Event Handlers

```typescript
flowTracer({
  include: {
    paths: ["src/**"],
    functions: ["handle*", "on*"],
  },
  exclude: {
    functions: ["handleInternal*", "_*"],
  },
});
```

### API Call Tracking

```typescript
flowTracer({
  include: {
    paths: ["src/api/**", "src/services/**"],
    functions: ["fetch*", "get*", "post*", "put*", "delete*"],
  },
});
```

### QA Environment

```typescript
flowTracer({
  inject: process.env.NODE_ENV === "staging",
  runtimeControlled: true, // QA activates as needed
});
```

### Complete Tracing

```typescript
const enableTracing = process.env.INTERNAL_QA === "true";

flowTracer({
  inject: enableTracing,
  runtimeControlled: false, // Always on when tracing is enabled
  include: {
    paths: ["src/**"],
    functions: ["*"], // All functions
  },
  exclude: {
    functions: ["helper*"],
  },
});
```

## Troubleshooting

### Not Instrumenting

Check:

1. `inject` is `true`
2. File matches `include.paths` pattern
3. Function name matches `include.functions` pattern
4. File/function not in `exclude` patterns
5. Babel peer dependencies installed

### Dormant Mode Not Working

Ensure:

1. `runtimeControlled` is `true`
2. `inject` is `true` (default)
3. If this setup mounts the Dashboard, confirm tracing is started there
4. Otherwise use the lower-level start command documented in [@autotracer/flow](./flow)

### Monorepo Issues

Add Vite aliases with `/runtime` before base package:

```typescript
alias: {
  '@autotracer/flow/runtime': path.resolve(/* runtime path */),
  '@autotracer/flow': path.resolve(/* base path */),
}
```

### Build Errors

Install peer dependencies:

```bash
pnpm add -D @babel/core @babel/preset-typescript
```

## Related Packages

- [@autotracer/flow](./flow) - Runtime library (required)
- [@autotracer/logger](./logger) - Internal shared logger utility used by `@autotracer/flow`
- [@autotracer/plugin-babel-flow](./plugin-babel-flow) - Babel plugin for Next.js/Webpack
- [@autotracer/react18](./react18) - React component tracer (complementary)

## See Also

- [Quick Start Guide](/guide/quickstart-flow)
- [Installation Guide](/guide/installation-flow-vite)
- [Configuration Reference](/guide/config-flow)
- [Troubleshooting](/guide/troubleshooting)
