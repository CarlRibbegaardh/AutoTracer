# ReactTracer Installation - Create React App

Create React App uses the Babel plugin path.

To use build-time injection, your Create React App setup must expose Babel configuration first, for example through an ejected app or a CRACO-based setup.

## Step 1: Install Packages

```bash
pnpm add @autotracer/react18
pnpm add -D @autotracer/plugin-babel-react18
```

For browser-based internal web apps, the normal control surface is the Dashboard. On the Create React App Babel path, mount it manually when you want that workflow:

```bash
pnpm add -D @autotracer/dashboard
```

## Step 2: Initialize ReactTracer Before React Renders

```typescript
// src/index.tsx
import { createRoot } from "react-dom/client";
import App from "./App";

const isDevelopment = process.env.NODE_ENV === "development";
const isInternalQa = process.env.REACT_APP_INTERNAL_QA === "true";

async function bootstrap(): Promise<void> {
  if (isDevelopment || isInternalQa) {
    const { reactTracer } = await import("@autotracer/react18");

    reactTracer({
      enabled: isDevelopment,
    });
  }

  createRoot(document.getElementById("root")!).render(<App />);
}

void bootstrap();
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

## Step 3: Add The Babel Plugin

After your Create React App setup exposes Babel configuration, add `@autotracer/plugin-babel-react18` there. Use [ReactTracer Babel Plugin Settings](/reference/build/react18/babel/) for exact option behavior.

```javascript
// .babelrc
{
  "plugins": [
    ["@autotracer/plugin-babel-react18"]
  ]
}
```

## Next Steps

- [ReactTracer Configuration](/guide/config-react) - recommended runtime and Babel-based setup
- [ReactTracer Runtime Settings](/reference/runtime/react18/) - exact `reactTracer()` option behavior
- [ReactTracer Babel Plugin Settings](/reference/build/react18/babel/) - exact Babel plugin option behavior
- [@autotracer/react18](/api/react18) - runtime APIs such as `reactTracer()`, `useReactTracer()`, and `updateReactTracerOptions()`
