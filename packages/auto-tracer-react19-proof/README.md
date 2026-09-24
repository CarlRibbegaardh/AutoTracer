# @autotracer/react19-proof

`@autotracer/react19-proof` is the private integration harness for `@autotracer/react19`. It runs the ReactTracer behavior contract against React `19.2.0` without Babel or Vite injection, so a failure points to runtime behavior rather than a build transform.

This workspace package is for AutoTracer maintainers. Applications should install `@autotracer/react19` and the build plugin for their toolchain instead.

## What It Proves

The harness covers the React 18 runtime scenarios carried into the React 19 product line and the React 19 state-hook additions. Its scenarios exercise:

- initial props and state;
- prop and state changes;
- labeled and unlabeled hooks;
- custom hooks and identical-value detection;
- tree rendering and empty-node filters;
- runtime option behavior and focused regression reproductions; and
- `useActionState` and `useOptimistic` through the generic hook-label contract.

The React 19 hooks do not use a separate output format. Their values and returned functions pass through the same `labelState()` mechanism used by existing state hooks.

## Public API Boundary

Proof components import from `@autotracer/react19`. They do not reach into runtime implementation files.

Each component calls `useReactTracer()` and `labelState()` explicitly. This reproduces the code that a build plugin would inject while keeping the runtime test independent of Babel and Vite.

```tsx
import { useReactTracer } from "@autotracer/react19";
import { useState } from "react";

/** Renders a manually labeled counter for runtime verification. */
export function LabeledCounter() {
  const tracer = useReactTracer({ name: "LabeledCounter" });
  const [count, setCount] = useState(0);

  tracer.labelState(0, "count", count, "setCount", setCount);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

If an application failure depends on build-time injection, reduce it in the injector or plugin package first. Add it here when the remaining failure can be expressed through the runtime's public API.

## Structure

The component tree is grouped by behavior:

```text
src/
├── initial-props/
├── initial-state/
├── prop-changes/
├── special-cases/
├── state-changes/
└── tree-rendering/
```

Unit tests live under `tests/unit/` and mirror the same folders. Shared browser and React test setup stays under `tests/`.

A scenario should remain small enough that its purpose is visible from the component and test names. When a reproduction needs several components, keep the cooperating files in one behavior folder.

## Adding A Scenario

1. Add the smallest component or hook that expresses the behavior under `src/<behavior>/`.
2. Call only the public `@autotracer/react19` API.
3. Add the matching test under `tests/unit/<behavior>/`.
4. Assert on user-visible output or captured trace output with direct string comparisons.
5. Run the proof suite before testing a demo application.

The proof package is the first acceptance signal for runtime or shared tracing changes. Demo applications answer a different question: whether a complete build and browser integration works.

## Toolchain

- React and ReactDOM `19.2.0`
- TypeScript `~7.0.2` for the primary build
- TypeScript `~6.0.2` for the compatibility check
- Vite `8.2.1`
- Vitest `4.1.10` with jsdom
- Testing Library for component interaction

## Running The Harness

Run repository-defined scripts from the monorepo root:

```bash
pnpm --filter @autotracer/react19-proof test
pnpm --filter @autotracer/react19-proof build
```

`build` type-checks the package with TypeScript 7 and runs the TypeScript 6 compatibility project. Use the VS Code Testing UI for an individual test during local iteration. The repository-wide completion signal is:

```bash
pnpm verify
```

## License

MIT © Carl Ribbegårdh
