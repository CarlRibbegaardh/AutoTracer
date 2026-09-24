# React 19 Vite 8 TypeScript 6 Injection Proof

## Overview

This private example proves that `@autotracer/plugin-vite-react19` injects React 19 tracing into a Vite 8 application compiled with the supported TypeScript 6 minimum. It keeps the acceptance surface intentionally small: one component, one `useState` value, and the AutoTracer Dashboard.

Use this app only for local development or internal test and QA work. Do not inject or ship AutoTracer in a public-facing application.

## Why Use It

The example verifies the integration boundary without Redux, MUI, Flow tracing, or unrelated application behavior. It demonstrates that:

- the React tracer initializes disabled before React renders;
- the Vite plugin injects `useReactTracer` and labels the `count` state;
- the Dashboard starts visible and controls tracing and visibility;
- incrementing the counter after tracing starts logs `State change count:`; and
- the React runtime records at least one render.

The application source, Vite configuration, Playwright configuration, and acceptance test are intended to remain identical to the TypeScript 7 twin. Only package identity, compiler dependency and invocation, and compiler-specific README text may differ.

## Setup

Use Node.js 24 and pnpm from the repository root. Install the workspace dependencies with the repository's normal pnpm installation workflow.

This app installs only the TypeScript 6 compiler under the `typescript` dependency name:

```json
"typescript": "npm:@typescript/typescript6@~6.0.2"
```

The build invokes its `tsc6` binary. No TypeScript 7 package is installed by this app.

## Configuration

[Vite](vite.config.ts) runs development and preview servers on strict port `5207`. The React tracer plugin runs before the React plugin with these relevant settings:

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
pnpm --filter todo-example-vite8-react19-ts6-injected dev
```

Open `http://localhost:5207`, press `Alt+Shift+T`, and select **Increment**. The count changes from `0` to `1`, and the browser console reports the labeled state change.

The Playwright acceptance test starts the same development server, checks the initial runtime and Dashboard state, enables tracing, increments the counter, verifies labeled output and render collection, then exercises both hotkeys.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm --filter todo-example-vite8-react19-ts6-injected dev` | Start the strict-port Vite development server. |
| `pnpm --filter todo-example-vite8-react19-ts6-injected build` | Type-check both project references with `tsc6`, then build with Vite. |
| `pnpm --filter todo-example-vite8-react19-ts6-injected clean` | Remove build output and local TypeScript build metadata. |
| `pnpm --filter todo-example-vite8-react19-ts6-injected lint` | Check the app with oxlint. |
| `pnpm --filter todo-example-vite8-react19-ts6-injected lint:fix` | Apply supported oxlint fixes. |
| `pnpm --filter todo-example-vite8-react19-ts6-injected preview` | Preview the production build on strict port `5207`. |
| `pnpm --filter todo-example-vite8-react19-ts6-injected test:e2e` | Run the headless Chromium Playwright acceptance test. |

Run repository-defined scripts from the workspace root. The root verification workflow remains the final project-wide gate.
