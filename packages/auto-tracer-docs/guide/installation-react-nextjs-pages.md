# Installation - ReactTracer with Next.js Pages Router

Install and configure ReactTracer in a Next.js application using the Pages Router.

## Prerequisites

- Node.js 18+
- Next.js 12+ (Pages Router)
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

For browser-based internal web apps, the normal control surface is the Dashboard. On the Pages Router Babel path, mount it manually when you want that workflow:

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
        mode: "opt-out",
        include: { paths: ["pages/**", "components/**", "src/**"] },
        exclude: { paths: ["**/*.test.*", "**/*.spec.*"] },
      },
    ],
  ],
};
```

**Configuration Options:**

- `mode`: `'opt-in'` or `'opt-out'` (default: `'opt-out'`)
- `include.paths`: File patterns to transform
- `exclude.paths`: File patterns to skip
- `serverComponents`: Set to `false` for Pages Router

### 2. Initialize ReactTracer

Update `pages/_app.tsx`:

```typescript
// pages/_app.tsx
import type { AppProps } from "next/app";
import { Suspense, lazy, type ReactNode } from "react";

const isDevelopment = process.env.NODE_ENV === "development";
const isInternalQa = process.env.NEXT_PUBLIC_INTERNAL_QA === "true";

const AutoTracerBootstrap = lazy(async () => {
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

### 3. Create a Test Component

Create `pages/index.tsx`:

```typescript
// pages/index.tsx
import { useState } from "react";

export default function Home() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("Hello");

  return (
    <div>
      <h1>{message}</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setMessage("Updated!")}>Change Message</button>
    </div>
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

Open your browser to `http://localhost:3000` and check the console—you should see React component lifecycle traces.

## What You'll See

When components render, the console shows:

```
Component mount: Home
  State: count = 0
  State: message = "Hello"

Component update: Home
  State: count = 1 (changed from 0)
  State: message = "Hello"
```

## Development Mode

Next.js Fast Refresh automatically provides the React DevTools hook, so tracing works out of the box during development.

## Restricted Test/QA Deployments

Do not include tracing in publicly accessible builds. If you deploy tracing to a restricted internal test/QA environment, you still need one of these DevTools hook sources:

### Option 1: React DevTools Extension (Recommended)

Install the [React DevTools browser extension](https://react.dev/learn/react-developer-tools) for your browser. The extension provides the DevTools hook automatically.

### Option 2: DevTools Hook Shim

Add a DevTools hook shim to `pages/_document.tsx`:

```typescript
// pages/_document.tsx
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  if (typeof window === 'undefined' || window.__REACT_DEVTOOLS_GLOBAL_HOOK__) return;
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
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

## Controlling Tracing

### Disable for Specific Components

Use the `@trace-disable` pragma:

```typescript
// @trace-disable
export default function HighFrequencyComponent() {
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
        "mode": "opt-in"
      }
    ]
  ]
}
```

Then use `@trace` pragma to enable tracing:

```typescript
// @trace
export default function TracedComponent() {
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
      include: { paths: ["pages/**", "components/**"] },
    },
  ]);
}

module.exports = {
  presets: ["next/babel"],
  plugins,
};
```

### Custom Hook Patterns

```javascript
// babel.config.js
{
  "plugins": [
    [
      "@autotracer/plugin-babel-react18",
      {
        "mode": "opt-out",
        "labelHooksPattern": "^(use|with)[A-Z].*"
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
        include: { paths: ["pages/**", "components/**"] },
      },
    ],
    [
      "@autotracer/plugin-babel-flow",
      {
        include: {
          paths: ["pages/api/**", "lib/**", "utils/**"],
          functions: ["*"],
        },
      },
    ],
  ],
};
```

```typescript
// pages/_app.tsx
import type { AppProps } from "next/app";
import { Suspense, lazy, type ReactNode } from "react";

const isDevelopment = process.env.NODE_ENV === "development";
const isInternalQa = process.env.NEXT_PUBLIC_INTERNAL_QA === "true";

const AutoTracerBootstrap = lazy(async () => {
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

## Troubleshooting

### Tracing Not Working

**Check:**

1. `babel.config.js` exists in project root
2. `@autotracer/plugin-babel-react18` in plugins array
3. `reactTracer()` called in `_app.tsx`
4. React DevTools installed or shim added
5. Browser console open for trace output
6. If this setup starts dormant, confirm tracing is started from the Dashboard when mounted, or through `globalThis.autoTracer.reactTracer.start()` in non-Dashboard setups

### Components Not Traced

**Check:**

1. File matches `include` patterns
2. File doesn't match `exclude` patterns
3. No `@trace-disable` pragma on component
4. Component is actually rendering

### Build Errors

**Common issues:**

- Missing `next/babel` preset - add it first in presets array
- Babel config syntax errors - validate JSON/JS syntax
- Plugin not installed - run `pnpm add -D @autotracer/plugin-babel-react18`

### Fast Refresh Issues

If Fast Refresh stops working:

1. Restart Next.js dev server
2. Clear the `.next` cache directory
3. Check Babel config syntax

## Next Steps

- [ReactTracer Configuration](/guide/config-react) - recommended runtime and Babel-based setup
- [ReactTracer Runtime Settings](/reference/runtime/react18/) - exact `reactTracer()` option behavior
- [ReactTracer Babel Plugin Settings](/reference/build/react18/babel/) - exact Babel plugin option behavior
- [Troubleshooting](/guide/troubleshooting) - Common issues and solutions
- [@autotracer/react18](/api/react18) - runtime APIs such as `reactTracer()`, `useReactTracer()`, and `updateReactTracerOptions()`

## See Also

- [Next.js App Router Installation](/guide/installation-react-nextjs-app) - App Router setup
- [Vite Installation](/guide/installation-react-vite) - Vite alternative
- [FlowTracer Installation](/guide/installation-flow-nextjs) - Function tracing for Next.js
