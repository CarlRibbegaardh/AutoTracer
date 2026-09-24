# React 19 Vite 8 TypeScript 7 Injection Proof

## Overview

This private example proves that `@autotracer/plugin-vite-react19` injects React 19 tracing into a Vite 8 application compiled with the primary TypeScript 7 compiler. It is also the uncompiled control for the React Compiler acceptance app.

Use this app only for local development or internal test and QA work. Do not inject or ship AutoTracer in a public-facing application.

## Why Use It

The example verifies the integration boundary without Redux, MUI, Flow tracing, or unrelated application behavior. It demonstrates that:

- the React tracer initializes disabled before React renders;
- the Vite plugin injects `useReactTracer` and labels the `count` state;
- the Dashboard starts visible and controls tracing and visibility;
- incrementing the counter after tracing starts logs `State change count:`; and
- the React runtime records at least one render;
- development and production-preview behavior works in Chromium, Firefox, and WebKit; and
- Fast Refresh preserves traced state and active tracing in Chromium.

The application source, TypeScript configuration, lint configuration, baseline browser behavior, and HMR behavior stay aligned with the React Compiler twin. The compiler twin differs only where compiler setup, identity, port, and compiler-output assertions require it.

## Setup

Use Node.js 24 and pnpm from the repository root. Install the workspace dependencies with the repository's normal pnpm installation workflow.

This app installs only the primary TypeScript 7 compiler:

```json
"typescript": "~7.0.2"
```

The build invokes its `tsc` binary. No TypeScript 6 package is installed by this app.

## Configuration

[Vite](vite.config.ts) runs development and preview servers on strict port `5208`. The React tracer plugin runs before the React plugin with these relevant settings:

- injection enabled in opt-out mode for `src/**/*.tsx`;
- runtime imports from `@autotracer/react19`;
- `useState` labels enabled;
- copy-paste output mode; and
- Dashboard enabled, visible by default, at the bottom right.

The Dashboard uses its documented controls:

- `Alt+Shift+T` toggles React tracing.
- `Alt+Shift+D` toggles Dashboard visibility.

[src/main.tsx](src/main.tsx) initializes the runtime with tracing disabled and mount/render collection enabled before `createRoot` renders the app.

## Usage

Start the app from the repository root:

```bash
pnpm --filter todo-example-vite8-react19-ts7-injected dev
```

Open `http://localhost:5208`, press `Alt+Shift+T`, and select **Increment**. The count changes from `0` to `1`, and the browser console reports the labeled state change.

The baseline Playwright acceptance runs against development and production-preview servers in Chromium, Firefox, and WebKit. The isolated Chromium HMR test changes the committed probe marker, verifies that state and tracing survive without a reload, checks the next `probeCount` label, and restores the source in cleanup.

## Scripts

| Script                                                                   | Purpose                                                              |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `pnpm --filter todo-example-vite8-react19-ts7-injected dev`              | Start the strict-port Vite development server.                       |
| `pnpm --filter todo-example-vite8-react19-ts7-injected build`            | Type-check both project references with `tsc`, then build with Vite. |
| `pnpm --filter todo-example-vite8-react19-ts7-injected clean`            | Remove build output and local TypeScript build metadata.             |
| `pnpm --filter todo-example-vite8-react19-ts7-injected lint`             | Check the app with oxlint.                                           |
| `pnpm --filter todo-example-vite8-react19-ts7-injected lint:fix`         | Apply supported oxlint fixes.                                        |
| `pnpm --filter todo-example-vite8-react19-ts7-injected preview`          | Preview the production build on strict port `5208`.                  |
| `pnpm --filter todo-example-vite8-react19-ts7-injected test:e2e`         | Run development acceptance in Chromium, Firefox, and WebKit.         |
| `pnpm --filter todo-example-vite8-react19-ts7-injected test:e2e:hmr`     | Run the isolated Chromium Fast Refresh continuity test.              |
| `pnpm --filter todo-example-vite8-react19-ts7-injected test:e2e:preview` | Run production-preview acceptance in Chromium, Firefox, and WebKit.  |

Run repository-defined scripts from the workspace root. The root verification workflow remains the final project-wide gate.
