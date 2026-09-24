# FlowTracer Quick Start

Get function execution tracing working in 5 minutes.

For a function call connected to React state and renders, follow [Your First Trace](./first-trace). To run and explain an existing unit test, use [FlowTracer in Vitest](./capture/flow-vitest).

## Prerequisites

- JavaScript/TypeScript project
- Node.js 18+ installed
- Build tool (Vite, Webpack, etc.)
- Package manager (pnpm, npm, or yarn)

> **Enterprise usage pattern**
>
> In large apps, the limiting factor is usually console output volume and DevTools rendering.
> Enable tracing only right before the action you want to observe, keep the scope narrow (include/exclude filters), then disable it immediately.
> In browser-based apps, the recommended runtime control surface for this workflow is the [Dashboard](/dashboard/webapps).
> The dashboard controls tracing, but it does not display trace output by itself.

## Step 1: Install Packages

Install the runtime, plus the build plugin for your platform.

```bash
# Using pnpm (recommended)
pnpm add @autotracer/flow
pnpm add -D @autotracer/plugin-vite-flow @babel/core @babel/preset-typescript
# or (for Babel/Webpack)
pnpm add -D @autotracer/plugin-babel-flow @babel/core

# Using npm
npm install @autotracer/flow
npm install --save-dev @autotracer/plugin-vite-flow @babel/core @babel/preset-typescript
# or (for Babel/Webpack)
npm install --save-dev @autotracer/plugin-babel-flow @babel/core

# Using yarn
yarn add @autotracer/flow
yarn add -D @autotracer/plugin-vite-flow @babel/core @babel/preset-typescript
# or (for Babel/Webpack)
yarn add -D @autotracer/plugin-babel-flow @babel/core
```

`@autotracer/logger` installs automatically with `@autotracer/flow`.

## Step 2: Configure Build Plugin

### For Vite

This quickstart opts out of the dormant default so you can confirm installation immediately.

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import { flowTracer } from "@autotracer/plugin-vite-flow";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const tracing = mode === "development" || env.VITE_INTERNAL_QA === "true";

  return {
    plugins: [
      flowTracer({
        inject: tracing,
        runtimeControlled: false,
        include: {
          paths: ["src/**/*.ts", "src/**/*.tsx"],
        },
      }),
    ],
  };
});
```

The default exclusions already skip common test files, build outputs, coverage folders, and dependency folders.

For deployed QA capture, set `VITE_INTERNAL_QA=true` in `.env.qa` and build with `pnpm exec vite build --mode qa`. Use `runtimeControlled: true` to leave tracing dormant until the action. Capture from the deployed URL as described in [QA Deployment](/best-practices/production).

### For Webpack

```bash
pnpm add -D @autotracer/plugin-babel-flow @babel/core
```

```javascript
// babel.config.cjs — merge with your existing presets and plugins
module.exports = (api) => {
  const development = api.env("development");
  const internalQa = api.cache.using(
    () => process.env.REACT_APP_INTERNAL_QA === "true"
  );
  const tracing = development || internalQa;
  return {
    plugins: tracing ? [
      ["@autotracer/plugin-babel-flow", {
        include: { paths: ["src/**/*.js", "src/**/*.ts", "src/**/*.tsx"] },
        exclude: { paths: ["**/src/main.*", "**/src/index.*"] },
      }],
    ] : [],
  };
};
```

Use [FlowTracer Babel settings](/reference/build/flow/babel/) for the exact Babel option behavior.

Keep Babel's environment and Webpack's mode aligned. For a restricted QA build, set `REACT_APP_INTERNAL_QA=true` in the build environment while retaining the intended optimization mode. Custom Webpack setups must also replace `process.env.REACT_APP_INTERNAL_QA` in client code with the same build-time value using `DefinePlugin`; CRA already exposes this prefix. Leave the flag absent or false for public builds. Retain existing loaders and presets, and exclude the bootstrap entry because it runs before the runtime exists.

## Step 3: Initialize Runtime

For Vite, no manual runtime initialization is required. For Babel/Webpack entry points, lazy-load the runtime before loading the rest of your app:

```typescript
// src/main.ts or src/index.ts
async function bootstrap(): Promise<void> {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.REACT_APP_INTERNAL_QA === "true"
  ) {
    await import("@autotracer/flow");
  }

  await import("./app");
}

void bootstrap();
```

Notes:

- **Vite:** When using `@autotracer/plugin-vite-flow`, you do not need to add this import manually. The plugin injects `@autotracer/flow/runtime` when `runtimeControlled` is `true` or omitted, and `@autotracer/flow` when `runtimeControlled` is `false`.
- **Babel/Webpack:** Use a compile-time-removable flag and import the rest of your app after the intended runtime entry so `globalThis.__flowTracer` exists before instrumented code runs. Use `@autotracer/flow` for immediate startup or `@autotracer/flow/runtime` for dormant startup.

For larger apps and restricted internal test or QA environments, switch back to dormant mode after the initial smoke test. That usually means `runtimeControlled: true` in Vite, or importing `@autotracer/flow/runtime` in your bootstrap path for Babel-based setups.

## Step 4: Write Traceable Code

Create a simple example to see tracing in action:

```typescript
// src/calculator.ts
export function calculateTotal(items: Array<{ price: number }>) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

export function applyDiscount(total: number, discount: number) {
  return total * (1 - discount);
}

// src/app.ts (Babel/Webpack); src/main.ts (Vite)
import { calculateTotal, applyDiscount } from "./calculator";

const items = [{ price: 10 }, { price: 20 }, { price: 30 }];

const total = calculateTotal(items);
const discounted = applyDiscount(total, 0.1);

console.log("Final price:", discounted);
```

On Babel/Webpack, keep the bootstrap entry from Step 3 and put these application calls in `src/app.ts`. Do not replace that entry with static application imports: the runtime must load before instrumented code executes. For JavaScript-only projects, use `.js` files and omit the TypeScript annotations.

## Step 5: Run and See Results

```bash
# For Vite
pnpm dev

# For Webpack
pnpm start
```

**Expected Console Output:**

```
→ calculateTotal
param items: [{"price":10},{"price":20},{"price":30}]
returned: 60
← calculateTotal (elapsed: 0.5ms)

→ applyDiscount
param total: 60
param discount: 0.1
returned: 54
← applyDiscount (elapsed: 0.3ms)

Final price: 54
```

## Parameter Labels

The build plugin uses function names and parameter names when it injects trace calls.

```typescript
function processOrder(order) {
  const validated = validateOrder(order);
  const discounted = applyDiscounts(order);
  return discounted;
}
```

**Output with labels:**

```
→ processOrder
param order: {"id":123,"total":100}
  → validateOrder
  param order: {"id":123,"total":100}
  returned: true
  ← validateOrder (elapsed: 0.2ms)
returned: {"id":123,"total":90}
← processOrder (elapsed: 0.6ms)
```

## Configuration Options

Use these reference pages for configuration details:

- [FlowTracer Configuration](./config-flow) for choosing the Vite or Babel path and the runtime startup mode.
- [FlowTracer Vite settings](/reference/build/flow/vite/) for exact Vite option behavior.
- [FlowTracer Babel settings](/reference/build/flow/babel/) for exact Babel option behavior.
- [FlowTracer Runtime Settings](/reference/runtime/flow/) for runtime installation, dormant mode, and browser control.
- [FlowTracer Theme API](/themes/flow/api) and [FlowTracer Example Themes](/themes/flow/examples) for Vite theme files. Use [`theme`](/reference/runtime/flow/config/theme) only when you are already working on the separate manual tracer path.

## Selective Tracing

Selective tracing is controlled by build-time filtering:

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

## Async Function Support

FlowTracer automatically handles async functions:

```typescript
async function fetchUserData(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

const user = await fetchUserData("123");
```

**Output:**

```
→ fetchUserData (async started)
param userId: "123"
returned: Promise
← fetchUserData (async completed, elapsed: 142.7ms)
```

Here `return response.json()` returns a promise. The exit marker can occur before JSON parsing settles, so its elapsed time is not proof that the complete operation finished. See [async exit versus promise settlement](./capture/analyze#async-exit-is-not-always-promise-settlement).

## Troubleshooting

### Not Seeing Output?

1. Verify build plugin is configured correctly
2. If using Babel/Webpack, ensure your intended runtime entry is imported in your entry file: `@autotracer/flow` for immediate startup or `@autotracer/flow/runtime` for dormant startup
3. Ensure files match `include.paths` patterns
4. For dormant mode, ensure the dormant runtime path is active: in Vite, keep `inject` enabled and leave `runtimeControlled` at `true`; in Babel/Webpack, import `@autotracer/flow/runtime` before the rest of the app, then start tracing through the Dashboard if it is mounted, or through `globalThis.autoTracer.flowTracer.start()` in non-Dashboard setups

### Too Much Output?

Use more specific patterns:

```typescript
// Build time - narrow what gets instrumented
// vite.config.ts (snippet)
import { flowTracer } from "@autotracer/plugin-vite-flow";

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

### Performance Impact?

When tracing is active, overhead can be noticeable in large apps (often dominated by console output and DevTools rendering). To minimize:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { flowTracer } from "@autotracer/plugin-vite-flow";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const tracing = mode === "development" || env.VITE_INTERNAL_QA === "true";

  return {
    plugins: [
      flowTracer({
        inject: tracing,
      }),
    ],
  };
});
```

## Example: API Integration

```typescript
// src/api.ts
export async function loginUser(email: string, password: string) {
  const response = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}

// src/main.ts
import { loginUser } from "./api";

try {
  const user = await loginUser("alice@example.com", "password123");
  console.log("Logged in:", user);
} catch (error) {
  console.error("Login error:", error);
}
```

**Console Output:**

```
→ loginUser (async started)
param email: "alice@example.com"
param password: "password123"
returned: Promise
← loginUser (async completed, elapsed: 287.3ms)

Logged in: {id: 1, name: "Alice", token: "abc123..."}
```

## Next Steps

- [Capture Workflows](./capture/) - Run one action or test and collect its trace
- [Analyze a Trace](./capture/analyze) - Explain observed calls and values
- [Use With an AI Agent](./agents) - Automate setup, capture, and explanation

- [Vite Installation](./installation-flow-vite) - Detailed Vite setup
- [Next.js Installation](./installation-flow-nextjs) - Detailed Next.js and Babel setup
- [Configuration](./config-flow) - All configuration options
- [FlowTracer Babel settings](/reference/build/flow/babel/) - Exact Babel plugin option behavior
- [FlowTracer Runtime Settings](/reference/runtime/flow/) - Runtime installation, dormant mode, and browser control
- [FlowTracer Theme API](/themes/flow/api) - Theme files and the runtime `theme` setting
- [API Reference](/api/flow) - Complete API documentation
- [Examples](/examples/basic-usage) - Real-world patterns

## Need Help?

- Check [Troubleshooting](./troubleshooting) for common issues
- Review [Best Practices](/best-practices/performance) for optimization
- See [Examples](/examples/basic-usage) for more patterns
