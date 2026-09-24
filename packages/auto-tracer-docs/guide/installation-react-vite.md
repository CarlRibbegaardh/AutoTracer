# ReactTracer Installation - Vite

Complete guide for installing ReactTracer in a Vite + React project.

## Prerequisites

- Vite 4+ project with React 18+
- Node.js 18+ installed

## Step 1: Install Packages

```bash
# Core runtime package
pnpm add @autotracer/react18

# Build plugin for variable labels (optional but recommended)
pnpm add -D @autotracer/plugin-vite-react18
```

## Step 2: Configure Vite Plugin

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { reactTracer } from "@autotracer/plugin-vite-react18";

export default defineConfig(({ mode }) => ({
  plugins: [
    // Place reactTracer BEFORE react plugin
    reactTracer.vite({
      inject: mode === "development",
    }),
    react(),
  ],
}));
```

## Step 3: Initialize in Entry File

```typescript
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

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

ReactTracer starts dormant by default. This install guide uses `enabled: true` so you can verify setup immediately. For restricted internal browser builds where you want targeted capture windows, start with `enabled: false` and use the [Dashboard workflow](/dashboard/webapps).

::: warning Immediate startup can overwhelm DevTools
Immediate startup is useful for confirming setup in a small app. In a large app or a provider-heavy page, tracing from bootstrap can generate enough render output to flood DevTools before you even reach the interaction you care about. Use `enabled: true` at startup with care. If the site is large, prefer dormant startup and a narrow capture window through the [Dashboard workflow](/dashboard/webapps).
:::

## Step 4: Verify Installation

Create a test component:

```typescript
// src/App.tsx
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>ReactTracer Test</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

export default App;
```

Run the dev server:

```bash
pnpm dev
```

Open browser console and click the button. You should see:

```
Component render cycle 1:
└─ [App] Mount ⚡
    Initial state count: 0

Component render cycle 2:
└─ [App] Update
    State change count: 0 → 1
```

## Configuration And Next Decisions

After the basic install works, use the canonical reference pages instead of treating this install guide as a settings manual:

- [ReactTracer Vite Plugin Settings](/reference/build/react18/vite/) for exact `reactTracer.vite()` option behavior
- [ReactTracer Runtime Settings](/reference/runtime/react18/) for exact `reactTracer()` option behavior
- [Pragma Comments](/reference/build/react18/vite/pragmas) for `@trace` and `@trace-disable`
- [ReactTracer Theme API](/themes/react18/api) for Vite root theme files and runtime `colors`
- [Dashboard For Web Apps](/dashboard/webapps) for dormant startup and targeted browser capture windows

Keep tracing out of publicly accessible builds. Use build-time injection only in local development or restricted internal QA-style builds.

## Troubleshooting

If tracing does not start, check the two owning entry points first:

- `reactTracer.vite()` must run before `react()` in `vite.config.ts`
- `reactTracer()` must run before `createRoot(...).render(...)` in `src/main.tsx`

If labels are missing, use the build settings pages for [`include`](/reference/build/react18/vite/config/include), [`exclude`](/reference/build/react18/vite/config/exclude), [`labelHooks`](/reference/build/react18/vite/config/labelHooks), [`labelHooksPattern`](/reference/build/react18/vite/config/labelHooksPattern), and [Pragma Comments](/reference/build/react18/vite/pragmas).

If there is too much output, prefer dormant startup and the [Dashboard workflow](/dashboard/webapps), then tune the runtime settings on [ReactTracer Runtime Settings](/reference/runtime/react18/).

## Next Steps

- [ReactTracer Configuration](/guide/config-react) - recommended runtime and build-time path
- [ReactTracer Runtime Settings](/reference/runtime/react18/) - exact `reactTracer()` option behavior
- [ReactTracer Vite Plugin Settings](/reference/build/react18/vite/) - exact `reactTracer.vite()` option behavior
- [@autotracer/react18](/api/react18) - runtime APIs such as `reactTracer()`, `useReactTracer()`, and `updateReactTracerOptions()`
- [@autotracer/plugin-vite-react18](/api/plugin-vite-react18) - package overview, pragmas, examples, and troubleshooting
- [ReactTracer Theme API](/themes/react18/api) - colors and ReactTracer theme file behavior
- [Dashboard For Web Apps](/dashboard/webapps) - targeted browser capture workflow for internal builds
