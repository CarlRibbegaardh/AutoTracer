# ReactTracer Quick Start

Set up ReactTracer in an existing React 18 application and view component renders, state changes, and prop changes in the console.

## Prerequisites

- React 18 application. For React 19, use the [React 19 Quick Start](./quickstart-react19).
- Node.js 18+ installed
- Package manager (pnpm, npm, or yarn)

> **Enterprise usage pattern**
>
> In large apps, the limiting factor is usually console output volume and DevTools rendering.
> Keep tracing scoped to the area you’re investigating (opt-in mode, filtering) and enable it only for the specific action you’re debugging.
> Turn it off immediately afterward.
> In browser-based apps, the recommended runtime control surface for targeted captures is the [Dashboard](/dashboard/webapps).
> The dashboard controls tracing, but it does not display trace output by itself.

## Step 1: Install the Package

```bash
# Using pnpm (recommended)
pnpm add @autotracer/react18

# Using npm
npm install @autotracer/react18

# Using yarn
yarn add @autotracer/react18
```

## Step 2: Initialize Tracing

Add ReactTracer initialization **before React renders**. The React DevTools hook must also be available before React loads, through the browser extension or the matching AutoTracer build plugin. See [Vite installation](./installation-react-vite) or the [Next.js installation guide](./installation-react-nextjs-app) for setup.

ReactTracer starts dormant by default. The quick-start examples pass `enabled: true` so you can confirm setup immediately. For restricted internal browser builds where you want targeted capture windows instead, start with `enabled: false` and use the [Dashboard](/dashboard/webapps).

::: warning Immediate startup can overwhelm DevTools
Immediate startup is useful for confirming setup in a small app. In a large app or a provider-heavy page, tracing from bootstrap can generate enough render output to flood DevTools before you even reach the interaction you care about. Use `enabled: true` at startup with care. If the site is large, prefer dormant startup and a narrow capture window through the [Dashboard](/dashboard/webapps).
:::

The startup examples below use local-development conditions. For restricted QA deployments, use your existing QA build condition for both the build plugin and runtime import.

### For Vite Projects

```typescript
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

async function bootstrap(): Promise<void> {
  if (import.meta.env.DEV) {
    const { reactTracer } = await import("@autotracer/react18");

    reactTracer({
      enabled: true,
    });
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

void bootstrap();
```

### For Next.js Projects

```typescript
// pages/_app.tsx (Pages Router)
import type { AppProps } from "next/app";
import { Suspense, lazy, type ReactNode } from "react";

const AutoTracerBootstrap = lazy(async () => {
  if (process.env.NODE_ENV === "development") {
    const { reactTracer, isReactTracerInitialized } = await import(
      "@autotracer/react18",
    );

    if (!isReactTracerInitialized()) {
      reactTracer({
        enabled: true,
      });
    }
  }

  return {
    default: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Suspense fallback={null}>
      <AutoTracerBootstrap>
        <Component {...pageProps} />
      </AutoTracerBootstrap>
    </Suspense>
  );
}
```

```typescript
// app/AutoTracerBootstrap.tsx
"use client";

import { Suspense, lazy, type ReactNode } from "react";

const AutoTracerBoundary = lazy(async () => {
  if (process.env.NODE_ENV === "development") {
    const { reactTracer, isReactTracerInitialized } = await import(
      "@autotracer/react18",
    );

    if (!isReactTracerInitialized()) {
      reactTracer({
        enabled: true,
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
    <html>
      <body>
        <AutoTracerBootstrap>{children}</AutoTracerBootstrap>
      </body>
    </html>
  );
}
```

## Step 3: Run Your Application

```bash
# For Vite
pnpm dev

# For Next.js
pnpm run dev
```

## Step 4: See the Results

Open your browser console and interact with your application. The examples below show labeled state values; add the build-time plugin described under [Adding Variable Labels](#adding-variable-labels-optional) to include those names.

```
Component render cycle 1:
├─ [App] Mount ⚡
│   Initial state count: 0
└─ [Counter] Mount ⚡
    Initial prop value: 0

Component render cycle 2:
└─ [Counter] Update
    State change count: 0 → 1
```

## Example Component

Try this simple counter to see tracing in action:

```typescript
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

export default Counter;
```

**Expected Console Output:**

```
Component render cycle 1:
├─ [Counter] Mount ⚡
│   Initial state count: 0

Component render cycle 2:
├─ [Counter] Rendering ⚡
│   State change count: 0 → 1

Component render cycle 3:
├─ [Counter] Rendering ⚡
│   State change count: 1 → 2
```

## Adding Variable Labels (Optional)

By default, ReactTracer shows state changes but not variable names. To see labeled output like `count: 0 → 1`, add build-time injection.

### For Vite

```bash
pnpm add -D @autotracer/plugin-vite-react18
```

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
    react(),
  ],
}));
```

For exact build-time option behavior, use [ReactTracer Vite Plugin Settings](/reference/build/react18/vite/).

### For Next.js

```bash
pnpm add -D @autotracer/plugin-babel-react18
```

```json
// .babelrc
{
  "presets": ["next/babel"],
  "plugins": [
    [
      "@autotracer/plugin-babel-react18",
      {
        "mode": "opt-out"
      }
    ]
  ]
}
```

## Configuration Options

Start with an explicit active initializer and add runtime options only when you need a specific behavior:

```typescript
reactTracer({ enabled: true });
```

For exact `reactTracer()` option behavior, use [ReactTracer Runtime Settings](/reference/runtime/react18/). For runtime APIs such as `useReactTracer()` and `updateReactTracerOptions()`, use [@autotracer/react18](/api/react18).

## Troubleshooting

### Not Seeing Output?

1. Check browser console is open
2. Verify `reactTracer()` is called before React renders
3. Ensure React DevTools is not disabled
4. Try an explicit `reactTracer({ enabled: true })` call

### Too Much Output?

Use filtering to focus on specific components:

```typescript
reactTracer({
  includeMount: "forPropsOrState",
  includeRendered: "forPropsOrState",
});
```

### Performance Impact?

When tracing is active, overhead can be noticeable in large apps (often dominated by console output and DevTools rendering). If concerned:

```typescript
// Only enable in development
if (import.meta.env.DEV) {
  reactTracer({ enabled: true });
}
```

## Next Steps

- [Browser Capture](/guide/capture/browser) - capture an action in a running application, locally or in QA

- [ReactTracer Configuration](/guide/config-react) - recommended runtime and build-time paths
- [ReactTracer Runtime Settings](/reference/runtime/react18/) - exact `reactTracer()` option behavior
- [ReactTracer Vite Plugin Settings](/reference/build/react18/vite/) - exact `reactTracer.vite()` option behavior
- [ReactTracer Babel Plugin Settings](/reference/build/react18/babel/) - exact Babel plugin option behavior for Next.js, CRA, and similar builds
- [@autotracer/react18](/api/react18) - runtime APIs such as `reactTracer()`, `useReactTracer()`, and `updateReactTracerOptions()`
- [@autotracer/plugin-vite-react18](/api/plugin-vite-react18) - package overview, pragmas, examples, and troubleshooting
- [ReactTracer Theme API](/themes/react18/api) - theme file behavior and precedence for Vite projects
- [Dashboard For Web Apps](/dashboard/webapps) - targeted browser capture workflow for internal builds

## Need Help?

- Check [Troubleshooting](./troubleshooting) for common issues
- Review [Best Practices](/best-practices/security) for deployment safety
- See [Examples](/examples/basic-usage) for more patterns
