# Installation - ReactTracer with Next.js App Router

Install and configure ReactTracer in a Next.js application using the App Router with React Server Components.

## Prerequisites

- Node.js 18+
- Next.js 13+ (App Router)
- React 18+
- React DevTools (browser extension or development mode)

## Installation

```bash
# Install runtime and Babel plugin
pnpm add @autotracer/react18
pnpm add -D @autotracer/plugin-babel-react18

# Using npm
npm install @autotracer/react18
npm install --save-dev @autotracer/plugin-babel-react18

# Using yarn
yarn add @autotracer/react18
yarn add -D @autotracer/plugin-babel-react18
```

For browser-based internal web apps, the normal control surface is the Dashboard. On the App Router Babel path, mount it manually when you want that workflow:

```bash
pnpm add -D @autotracer/dashboard
```

## Configuration

### 1. Configure Babel Plugin

Create or update `babel.config.js` in your project root:

```javascript
// babel.config.js
module.exports = {
  presets: ["next/babel"],
  plugins: [
    [
      "@autotracer/plugin-babel-react18",
      {
        serverComponents: true, // Important for App Router!
        include: { paths: ["app/**", "components/**", "src/**"] },
        exclude: { paths: ["**/*.test.*", "**/*.spec.*"] },
      },
    ],
  ],
};
```

**Critical Setting:**

- `serverComponents: true` - Only transforms files with `"use client"` directive

### 2. Create Client Provider

Create `app/AutoTracerBootstrap.tsx`:

```typescript
// app/AutoTracerBootstrap.tsx
"use client";

import { Suspense, lazy, type ReactNode } from "react";

const isDevelopment = process.env.NODE_ENV === "development";
const isInternalQa = process.env.NEXT_PUBLIC_INTERNAL_QA === "true";

const AutoTracerBoundary = lazy(async () => {
  if (isDevelopment || isInternalQa) {
    const { reactTracer, isReactTracerInitialized } = await import(
      "@autotracer/react18",
    );

    if (!isReactTracerInitialized()) {
      reactTracer({
        enabled: isDevelopment,
      });
    }
  }

  return {
    default: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

export function AutoTracerBootstrap({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AutoTracerBoundary>{children}</AutoTracerBoundary>
    </Suspense>
  );
}
```

ReactTracer starts dormant by default. This setup starts tracing immediately in development and leaves the runtime dormant in restricted internal QA builds unless you opt in deliberately.

If this internal browser setup uses dormant startup, mount the Dashboard in that same bootstrap path when you want the standard browser control surface:

```tsx
const { mountDashboard } = await import("@autotracer/dashboard");
mountDashboard();
```

Use [Dashboard Package Reference](/dashboard/reference) for `mountDashboard(...)` behavior. For package-side widget settings, use [Dashboard `enabled`](/dashboard/config/enabled), [Dashboard `hideByDefault`](/dashboard/config/hideByDefault), [Dashboard `position`](/dashboard/config/position), and [Dashboard `hotkeys`](/dashboard/config/hotkeys).

Use the lower-level `globalThis.autoTracer.reactTracer` API in tests, automation, and other non-Dashboard setups.

::: warning Immediate startup can overwhelm DevTools
Immediate startup is useful for confirming setup in a small app. In a large app or a provider-heavy page, tracing from bootstrap can generate enough render output to flood DevTools before you even reach the interaction you care about. Use `enabled: true` at startup with care. If the site is large, prefer dormant startup and a narrow capture window through the Dashboard instead of tracing the whole app from first render.
:::

### 3. Update Root Layout

Update `app/layout.tsx`:

```typescript
// app/layout.tsx
import type { ReactNode } from "react";
import { AutoTracerBootstrap } from "./AutoTracerBootstrap";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AutoTracerBootstrap>{children}</AutoTracerBootstrap>
      </body>
    </html>
  );
}
```

### 4. Create a Client Component

Create `app/counter.tsx`:

```typescript
// app/counter.tsx
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("Hello");

  return (
    <div>
      <h2>{message}</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setMessage("Updated!")}>Change Message</button>
    </div>
  );
}
```

### 5. Use in Page

Update `app/page.tsx`:

```typescript
// app/page.tsx
import { Counter } from "./counter";

export default function Home() {
  return (
    <main>
      <h1>Next.js App Router with ReactTracer</h1>
      <Counter />
    </main>
  );
}
```

## Running Your App

```bash
# Development mode
pnpm dev

# Or with npm
npm run dev
```

Open your browser to `http://localhost:3000` and check the console—you should see React component lifecycle traces from client components.

## What You'll See

When client components render, the console shows:

```
Component mount: Counter
  State: count = 0
  State: message = "Hello"

Component update: Counter
  State: count = 1 (changed from 0)
  State: message = "Hello"
```

**Note:** Server Components won't be traced (they don't have `"use client"` directive).

## Server Components vs Client Components

### Server Components (Not Traced)

```typescript
// app/server-component.tsx
// NO "use client" directive - this is a Server Component

export function ServerComponent() {
  // Runs on server only, not traced
  return <div>Server rendered content</div>;
}
```

### Client Components (Traced)

```typescript
// app/client-component.tsx
"use client"; // This directive enables tracing

import { useState } from "react";

export function ClientComponent() {
  // Runs in browser, traced by ReactTracer
  const [state] = useState(0);
  return <div>{state}</div>;
}
```

## Development Mode

Next.js Fast Refresh automatically provides the React DevTools hook, so tracing works out of the box during development.

## Restricted Test/QA Deployments

Do not include tracing in publicly accessible builds. If you deploy tracing to a restricted internal test/QA environment, you still need one of these DevTools hook sources:

### Option 1: React DevTools Extension (Recommended)

Install the [React DevTools browser extension](https://react.dev/learn/react-developer-tools) for your browser.

### Option 2: DevTools Hook Shim

Create a client component for the hook:

```typescript
// app/devtools-hook.tsx
"use client";

import { useEffect } from "react";

export function DevToolsHook() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !window.__REACT_DEVTOOLS_GLOBAL_HOOK__
    ) {
      let nextID = 0;
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
        renderers: new Map(),
        supportsFiber: true,
        inject: function (injected) {
          return nextID++;
        },
        onScheduleFiberRoot: function () {},
        onCommitFiberRoot: function () {},
        onCommitFiberUnmount: function () {},
      };
    }
  }, []);

  return null;
}
```

Then include it in your root layout:

```typescript
// app/layout.tsx
import { AutoTracerBootstrap } from "./AutoTracerBootstrap";
import { DevToolsHook } from "./devtools-hook";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DevToolsHook />
        <AutoTracerBootstrap>{children}</AutoTracerBootstrap>
      </body>
    </html>
  );
}
```

## Controlling Tracing

### Disable for Specific Components

Use the `@trace-disable` pragma:

```typescript
"use client";

// @trace-disable
export function HighFrequencyComponent() {
  const [value, setValue] = useState(0);
  return <div>{value}</div>;
}
```

### Opt-in Mode

Switch to opt-in mode in `babel.config.js`:

```javascript
{
  "plugins": [
    [
      "@autotracer/plugin-babel-react18",
      {
        "mode": "opt-in",
        "serverComponents": true
      }
    ]
  ]
}
```

Then use `@trace` pragma:

```typescript
"use client";

// @trace
export function TracedComponent() {
  const [state] = useState(0);
  return <div>{state}</div>;
}
```

> **Note:** `include`/`exclude` component filters define the eligible set and are evaluated before pragmas. `@trace` only operates within the eligible set and cannot rescue a component that misses an `include.components` filter or matches an `exclude.components` filter. For exact placement and precedence rules, see [Pragma Comments](/reference/build/react18/vite/pragmas).

### Environment-based Control

```javascript
// babel.config.js
const plugins = [];

if (process.env.ENABLE_TRACING === "1") {
  plugins.push([
    "@autotracer/plugin-babel-react18",
    {
      mode: "opt-out",
      serverComponents: true,
      include: { paths: ["app/**", "components/**"] },
    },
  ]);
}

module.exports = {
  presets: ["next/babel"],
  plugins,
};
```

### Selective Component Tracing

```javascript
// babel.config.js
{
  "plugins": [
    [
      "@autotracer/plugin-babel-react18",
      {
        "mode": "opt-out",
        "serverComponents": true,
        "include": { "paths": ["app/components/interactive/**"] },
        "exclude": { "paths": ["app/components/static/**"] }
      }
    ]
  ]
}
```

## Integration with FlowTracer

Combine ReactTracer with FlowTracer for complete visibility:

```bash
pnpm add @autotracer/flow
pnpm add -D @autotracer/plugin-babel-flow
```

`@autotracer/logger` installs automatically with `@autotracer/flow`.

```javascript
// babel.config.js
module.exports = {
  presets: ["next/babel"],
  plugins: [
    [
      "@autotracer/plugin-babel-react18",
      {
        mode: "opt-out",
        serverComponents: true,
        include: { paths: ["app/**", "components/**"] },
      },
    ],
    [
      "@autotracer/plugin-babel-flow",
      {
        include: {
          paths: ["app/api/**", "lib/**", "utils/**"],
          functions: ["*"],
        },
      },
    ],
  ],
};
```

```typescript
// app/providers.tsx
"use client";

import { Suspense, lazy, type ReactNode } from "react";

const isDevelopment = process.env.NODE_ENV === "development";
const isInternalQa = process.env.NEXT_PUBLIC_INTERNAL_QA === "true";

const AutoTracerBoundary = lazy(async () => {
  if (isDevelopment || isInternalQa) {
    await import("@autotracer/flow");
    await import("@autotracer/flow/runtime");

    const { reactTracer, isReactTracerInitialized } = await import(
      "@autotracer/react18",
    );

    if (!isReactTracerInitialized()) {
      reactTracer({
        enabled: isDevelopment,
      });
    }
  }

  return {
    default: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AutoTracerBoundary>{children}</AutoTracerBoundary>
    </Suspense>
  );
}
```

## Troubleshooting

### Client Components Not Traced

**Check:**

1. Component file has `"use client"` directive at the top
2. `serverComponents: true` in Babel config
3. `reactTracer()` called in providers
4. React DevTools hook available

### Server Components Traced (Unexpected)

**Issue:** Server Components shouldn't be traced.

**Solution:** Ensure `serverComponents: true` in Babel config:

```javascript
{
  "serverComponents": true
}
```

### Build Errors

**Common issues:**

- Missing `"use client"` directive - add it to client components
- Missing `next/babel` preset - add it first in presets array
- Plugin not installed - run `pnpm add -D @autotracer/plugin-babel-react18`

### Hydration Errors

If you get hydration mismatches:

1. Ensure `reactTracer()` called in `useEffect` (not during render)
2. Check no tracing output during SSR
3. Verify client/server boundaries correct

### Fast Refresh Issues

If Fast Refresh stops working:

1. Restart Next.js dev server
2. Clear the `.next` cache directory
3. Verify Babel config syntax

## Best Practices

### ✅ Do:

- Use `"use client"` for interactive components
- Initialize `reactTracer()` in the client bootstrap boundary, not during render
- Use `serverComponents: true` in Babel config

### ❌ Don't:

- Add `"use client"` to Server Components unnecessarily
- Call `reactTracer()` during render (causes hydration errors)

## Next Steps

- [ReactTracer Configuration](/guide/config-react) - recommended runtime and Babel-based setup
- [ReactTracer Runtime Settings](/reference/runtime/react18/) - exact `reactTracer()` option behavior
- [ReactTracer Babel Plugin Settings](/reference/build/react18/babel/) - exact Babel plugin option behavior
- [Troubleshooting](/guide/troubleshooting) - Common issues and solutions
- [@autotracer/react18](/api/react18) - runtime APIs such as `reactTracer()`, `useReactTracer()`, and `updateReactTracerOptions()`

## See Also

- [Next.js Pages Router Installation](/guide/installation-react-nextjs-pages) - Pages Router setup
- [Vite Installation](/guide/installation-react-vite) - Vite alternative
- [FlowTracer Installation](/guide/installation-flow-nextjs) - Function tracing for Next.js
