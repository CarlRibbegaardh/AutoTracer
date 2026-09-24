# React 19 Compiler Injection Proof

## Overview

This private Vite 8 application proves that React Compiler and `@autotracer/plugin-vite-react19` transform the same React 19 component while preserving labeled state tracing, Dashboard control, production behavior, and Fast Refresh continuity.

Use this app only for local development or internal test and QA work. Do not inject or ship AutoTracer in a public-facing application.

## Why Use It

The app is the compiled twin of `todo-example-vite8-react19-ts7-injected`. Together they isolate React Compiler as the meaningful variable and verify that:

- AutoTracer instruments `App` before React Compiler processes it;
- the emitted `App` contains compiler memo-cache behavior and `labelState`;
- labeled state tracing and Dashboard controls work in development and production builds;
- Chromium, Firefox, and WebKit execute the compiled application; and
- Chromium Fast Refresh preserves probe state and active tracing without a full reload.

## Setup

Use Node.js 24 and pnpm from the repository root. Install workspace dependencies through the repository's normal pnpm installation workflow.

The harness pins these compatibility inputs:

```json
{
  "@vitejs/plugin-react": "^4.3.1",
  "babel-plugin-react-compiler": "1.0.0",
  "typescript": "~7.0.2",
  "vite": "8.2.1"
}
```

React and React DOM are pinned to `19.2.0`. React 19 provides the compiler runtime through `react/compiler-runtime`, so this app does not install `react-compiler-runtime`.

## Configuration

[Vite](vite.config.ts) runs development and preview servers on strict port `5209`. The plugin sequence is:

1. `reactTracer.vite(...)` with pre-enforced AutoTracer injection.
2. `react(...)` with `babel-plugin-react-compiler` configured for target `"19"`.

The tracer injects into `src/**/*.tsx`, labels `useState`, uses copy-paste output, and mounts the Dashboard visible at the bottom right. [src/main.tsx](src/main.tsx) initializes tracing as disabled before React renders.

The Dashboard hotkeys are:

- `Alt+Shift+T` toggles React tracing.
- `Alt+Shift+D` toggles Dashboard visibility.

## Usage

Start the development server from the repository root:

```bash
pnpm --filter todo-example-vite8-react19-compiler-injected dev
```

Open `http://localhost:5209`, start tracing with `Alt+Shift+T`, and select **Increment**. The counter changes from `0` to `1`, and the browser console reports `State change count:`.

The development test also inspects Vite's served `App` module. It proves that the emitted component contains both React Compiler memo-cache code and AutoTracer state labeling rather than accepting a compiler bailout.

## Verification

| Script | Purpose |
| --- | --- |
| `pnpm --filter todo-example-vite8-react19-compiler-injected build` | Type-check with TypeScript 7 and create the Vite production build. |
| `pnpm --filter todo-example-vite8-react19-compiler-injected lint` | Check the app with oxlint. |
| `pnpm --filter todo-example-vite8-react19-compiler-injected test:e2e` | Run development acceptance in Chromium, Firefox, and WebKit. |
| `pnpm --filter todo-example-vite8-react19-compiler-injected test:e2e:hmr` | Run the isolated Chromium Fast Refresh continuity test. |
| `pnpm --filter todo-example-vite8-react19-compiler-injected test:e2e:preview` | Run production-preview acceptance in Chromium, Firefox, and WebKit. |

Run repository-defined scripts from the workspace root. `pnpm verify` is the final project-wide gate.
