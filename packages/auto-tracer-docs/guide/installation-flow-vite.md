# FlowTracer Installation - Vite

Complete guide for installing FlowTracer in a Vite project.

## Prerequisites

- Vite 4+ project
- Node.js 18+ installed
- TypeScript or JavaScript

## Step 1: Install Packages

```bash
# Core runtime package
pnpm add @autotracer/flow

# Vite plugin for build-time instrumentation
pnpm add -D @autotracer/plugin-vite-flow @babel/core @babel/preset-typescript
```

`@autotracer/logger` installs automatically with `@autotracer/flow`.

## Step 2: Configure Vite Plugin

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { flowTracer } from "@autotracer/plugin-vite-flow";

export default defineConfig(({ mode }) => ({
  plugins: [
    flowTracer({
      inject: mode === "development",
      include: {
        paths: ["src/**/*.{ts,tsx,js,jsx}"],
      },
    }),
  ],
}));
```

The default exclusions already skip common test files, build outputs, coverage folders, and dependency folders.

## Step 3: Initialize Runtime

```typescript
// src/main.ts (or src/index.ts)
// Your application code
import "./app";
```

No runtime initialization call is required.

When `inject` is `true`, the Vite plugin injects a side-effect import into the HTML before your app runs:

- `@autotracer/flow/runtime` when `runtimeControlled` is `true` or omitted
- `@autotracer/flow` when `runtimeControlled` is `false`

That install path creates:

- `globalThis.__flowTracer` (internal instrumentation target used by injected code)
- `globalThis.autoTracer.flowTracer` (runtime controls: `start/stop/isEnabled`)

## Step 4: Verify Installation

Create a test file:

```typescript
// src/calculator.ts
export function add(a: number, b: number) {
  return a + b;
}

export function multiply(a: number, b: number) {
  return a * b;
}

// src/main.ts
import { add, multiply } from "./calculator";

const sum = add(5, 3);
const product = multiply(sum, 2);

console.log("Result:", product);
```

Run the dev server:

```bash
pnpm dev
```

Check browser console:

```
→ add
param a: 5
param b: 3
returned: 8
← add (elapsed: 0.2ms)

→ multiply
param a: 8
param b: 2
returned: 16
← multiply (elapsed: 0.2ms)

Result: 16
```

## Configuration Options

Use these reference pages for configuration details:

- [FlowTracer Configuration](./config-flow) for `inject`, `runtimeControlled`, `dashboardConfig`, `prefix`, `include`, and `exclude`.
- [FlowTracer Runtime Settings](/reference/runtime/flow/) for runtime installation, dormant mode, and browser control.
- [FlowTracer Theme API](/themes/flow/api) and [FlowTracer Example Themes](/themes/flow/examples) for Vite theme files.
- [API Reference](/api/flow) for the exported runtime API.

## Selective Tracing

FlowTracer selection is controlled by build-time filtering.

Use `include` and `exclude` to narrow instrumentation by file path and/or function name.

```typescript
// vite.config.ts
flowTracer({
  include: {
    paths: ["src/business-logic/**/*.{ts,tsx,js,jsx}"],
    functions: ["calculate*", "process*"],
  },
  exclude: {
    functions: ["validate*"],
  },
});
```

## TypeScript Configuration

No special TypeScript configuration needed. Works with any `tsconfig.json`.

## Async Functions

FlowTracer automatically handles async functions and promises:

```typescript
// src/api.ts
export async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// src/main.ts
import { fetchUser } from "./api";

const user = await fetchUser("123");
console.log("User:", user);
```

**Output:**

```
→ fetchUser (async started)
param id: "123"
returned: Promise
← fetchUser (async completed, elapsed: 142.7ms)

User: {id: "123", name: "Alice"}
```

## Public Deployment Safety

Keep tracing out of publicly accessible builds:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { flowTracer } from "@autotracer/plugin-vite-flow";

export default defineConfig(({ mode }) => ({
  plugins: [
    flowTracer({
      inject: mode === "development", // Only instrument in dev
    }),
  ],
}));
```

Verify:

```bash
pnpm build
pnpm preview
# Should see no tracing output
```

## Troubleshooting

### Issue: No tracing output

**Solutions:**

1. Verify `inject` is `true` in `vite.config.ts`
2. Check files match `include.paths`
3. Confirm the plugin injected `@autotracer/flow` (check `globalThis.autoTracer?.flowTracer` in the browser console)
4. Check browser console for errors

### Issue: Functions not instrumented

**Solution:** Verify file patterns match your source files:

```typescript
// vite.config.ts (snippet)
import { flowTracer } from "@autotracer/plugin-vite-flow";

flowTracer({
  include: {
    paths: ["src/**/*.{ts,tsx,js,jsx}"],
  },
});
```

### Issue: Too much output

**Solution:** Use more specific patterns:

```typescript
// Build time - fewer files
// vite.config.ts (snippet)
import { flowTracer } from "@autotracer/plugin-vite-flow";

flowTracer({
  include: {
    paths: ["src/business-logic/**/*.{ts,tsx,js,jsx}"],
  },
});

// Build time - fewer functions
// vite.config.ts (snippet)
import { flowTracer } from "@autotracer/plugin-vite-flow";

flowTracer({
  include: {
    functions: ["calculate*", "process*"],
  },
  exclude: {
    functions: ["validate*"],
  },
});
```

### Issue: Build performance impact

**Solution:** Limit instrumentation scope:

```typescript
// vite.config.ts (snippet)
import { flowTracer } from "@autotracer/plugin-vite-flow";

flowTracer({
  inject: true,
  include: {
    paths: ["src/features/**/*.{ts,tsx,js,jsx}"],
  },
});
```

## Integration with React

FlowTracer works alongside ReactTracer:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { flowTracer } from "@autotracer/plugin-vite-flow";
import { reactTracer } from "@autotracer/plugin-vite-react18";

export default defineConfig({
  plugins: [
    flowTracer({
      /* config */
    }),
    reactTracer.vite({
      /* config */
    }),
    react(),
  ],
});

// src/main.tsx
async function bootstrap(): Promise<void> {
  if (import.meta.env.DEV) {
    const { reactTracer } = await import("@autotracer/react18");

    reactTracer({ enabled: true }); // Trace React components during development
  }
}

void bootstrap();
```

## Next Steps

- [Configuration Guide](./config-flow) - All configuration options
- [FlowTracer Runtime Settings](/reference/runtime/flow/) - Runtime installation, dormant mode, and browser control
- [FlowTracer Theme API](/themes/flow/api) - Theme files and the runtime `theme` setting
- [API Reference](/api/flow) - Complete API docs
- [Examples](/examples/basic-usage) - Real-world patterns
- [Best Practices](/best-practices/performance) - Optimization tips
