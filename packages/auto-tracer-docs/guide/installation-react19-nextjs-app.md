# React 19 Installation For Next.js App Router

This guide covers the App Router Babel path for `@autotracer/react19` with `@autotracer/plugin-babel-react19`. The build layer instruments eligible client components. The runtime layer still has to initialize `reactTracer()` in the browser before those components render.

This documented path covers Babel-based client-component injection only. Native Turbopack injection, React Server Component execution, and server actions are outside the documented React 19 coverage here.

## Step 1: Install The Packages

```bash
pnpm add react@19.2.0 react-dom@19.2.0 @autotracer/react19 @autotracer/dashboard
pnpm add -D @autotracer/plugin-babel-react19
```

The supported React floor is `19.2.0`. TypeScript 6 is the minimum supported consumer compiler.

## Step 2: Exclude The Babel Plugin From Public Builds

On the Babel path, runtime gating alone is not enough. If the plugin still runs in the public build, Babel still injects tracing code.

```js
// babel.config.js
const shouldTrace =
  process.env.NODE_ENV === "development" ||
  process.env.INTERNAL_QA === "true";

module.exports = {
  presets: ["next/babel"],
  plugins: shouldTrace
    ? [
        [
          "@autotracer/plugin-babel-react19",
          {
            mode: "opt-out",
            serverComponents: true,
          },
        ],
      ]
    : [],
};
```

With `serverComponents: true`, only modules with a top-level `"use client"` directive are eligible for injection.

If you need narrower file control, use the build reference pages for [`include`](/reference/build/react19/babel/config/include), [`exclude`](/reference/build/react19/babel/config/exclude), [`labelHooks`](/reference/build/react19/babel/config/labelHooks), and [`labelHooksPattern`](/reference/build/react19/babel/config/labelHooksPattern).

## Step 3: Initialize The Runtime In A Client Bootstrap Component

Mount the runtime in a client component near the top of the App Router tree.

```tsx
// app/AutoTracerBootstrap.tsx
"use client";

import { Suspense, lazy, type ReactNode } from "react";

const shouldTrace =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_INTERNAL_QA === "true";

const AutoTracerBoundary = lazy(async () => {
  if (shouldTrace) {
    const { isReactTracerInitialized, reactTracer } = await import(
      "@autotracer/react19"
    );

    if (!isReactTracerInitialized()) {
      reactTracer({ enabled: false });
    }

    const { mountDashboard } = await import("@autotracer/dashboard");
    mountDashboard();
  }

  return {
    default: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

export function AutoTracerBootstrap({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AutoTracerBoundary>{children}</AutoTracerBoundary>
    </Suspense>
  );
}
```

This keeps the React 19 runtime dormant at startup, mounts the Dashboard in the same browser path, and avoids duplicate initialization during client re-entry.

## Step 4: Mount The Bootstrap Component From The App Layout

```tsx
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

The runtime boundary is still the browser-side fiber tree. Components that execute only as React Server Components are outside that boundary.

## What `serverComponents: true` Actually Covers

- Files with a top-level `"use client"` directive remain eligible for injection.
- Files without `"use client"` are left unchanged.
- This path instruments client components inside an App Router tree.
- This path does not trace React Server Component execution.

## Dashboard First, `globalThis` Second

In internal browser builds, the Dashboard is the normal control surface.

- Start tracing from the widget when you are ready to capture.
- Stop tracing immediately when the relevant interaction is done.

If you deliberately skip the Dashboard, the lower-level fallback is still available after runtime initialization:

```js
globalThis.autoTracer.reactTracer.start();
globalThis.autoTracer.reactTracer.stop();
```

## Current Limits

- Native Turbopack injection is not covered by this guide.
- React Server Component execution is not covered by this guide.
- Server actions are not covered by this guide.

## Read Next

- [React 19 Quick Start](/guide/quickstart-react19)
- [React 19 Configuration](/guide/config-react19)
- [React 19 Runtime API](/api/react19)
- [React 19 Babel Plugin API](/api/plugin-babel-react19)
- [React 19 Babel Plugin Settings](/reference/build/react19/babel/)
- [Dashboard Package Reference](/dashboard/reference)
