# @autotracer/plugin-babel-react19

## Overview

`@autotracer/plugin-babel-react19` is the AutoTracer build-time plugin for React 19 applications compiled with Babel. It injects `useReactTracer()` calls and supported hook labels while leaving runtime initialization under application control.

Use this package only in local development or restricted internal test and QA builds. AutoTracer can expose component props, state, and application structure, so exclude the Babel plugin from public-facing builds.

## Why Use It

The plugin connects Babel's parser lifecycle to `@autotracer/inject-react19`. It preserves Babel parser options, reparses transformed code with `@babel/parser` to avoid running the full Babel pipeline twice, and falls back to Babel's parser when transformation fails or the file is ineligible.

It supports the shared injector's file filters, component filters, pragma behavior, hook labeling, import source, and React Server Component eligibility. Babel configuration can also set a component-name prefix or seed the runtime output mode.

## Requirements

- React 19 and `@autotracer/react19`
- Babel 7 through the `@babel/core` peer dependency
- TypeScript 6 or newer for TypeScript consumers; package declarations are emitted with TypeScript 7

## Installation

```bash
pnpm add @autotracer/react19
pnpm add -D @autotracer/plugin-babel-react19
```

Add the plugin to Babel:

```json
{
  "plugins": [
    [
      "@autotracer/plugin-babel-react19",
      {
        "mode": "opt-out"
      }
    ]
  ]
}
```

## Configuration

| Option | Type | Default | Purpose |
| --- | --- | --- | --- |
| `mode` | `"opt-in" \| "opt-out"` | Injector default | Selects pragma eligibility behavior. |
| `include` | Injector path/component filter | Injector default | Restricts eligible files and components. |
| `exclude` | Injector path/component filter | Injector default | Excludes files and components. |
| `importSource` | `string` | `@autotracer/react19` | Changes the injected runtime import. |
| `labelHooks` | `string[]` | `[]` | Adds hook names whose returned values should be labeled. |
| `labelHooksPattern` | `string` | Injector default | Adds hook names by regular-expression source. |
| `serverComponents` | `boolean` | `false` | Restricts injection to modules with a top-level `"use client"` directive. |
| `prefix` | `string` | none | Prefixes injected component names. |
| `outputMode` | `"devtools" \| "copy-paste"` | Runtime default | Seeds output behavior before runtime initialization. |

The [React 19 Babel API](https://docs.autotracer.dev/api/plugin-babel-react19) lists the package entry point and public options. The [Babel settings reference](https://docs.autotracer.dev/reference/build/react19/babel/) documents each shared transform setting separately.

Setting `TRACE_INJECT=0` bypasses transformation and delegates directly to Babel's parser.

Exclude the plugin in the Babel configuration used for public builds. Runtime disabling is not a substitute because leaving the plugin enabled still injects tracing code.

```js
const shouldTrace =
  process.env.NODE_ENV === "development" ||
  process.env.INTERNAL_QA === "true";

module.exports = {
  plugins: shouldTrace
    ? [["@autotracer/plugin-babel-react19", { mode: "opt-out" }]]
    : [],
};
```

## Next.js Client Components

For a Next.js App Router source tree, enable `serverComponents` so only client modules are instrumented:

```js
module.exports = {
  plugins: [
    [
      "@autotracer/plugin-babel-react19",
      {
        mode: "opt-out",
        serverComponents: true,
      },
    ],
  ],
};
```

The directive must be at the top level of each eligible client module:

```tsx
"use client";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

Modules without a top-level `"use client"` directive are left unchanged when `serverComponents` is enabled. This plugin instruments client components; it does not trace React Server Component execution.

The plugin runs through Babel's parser lifecycle. It does not provide native Turbopack injection. Use a Next.js build path that executes the Babel configuration when AutoTracer instrumentation is required.

## Runtime Startup

Initialize ReactTracer separately before the client application renders. Use the same build-time decision for the Babel plugin and runtime loading so public builds contain neither instrumentation nor runtime startup.

```tsx
const shouldTrace =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_INTERNAL_QA === "true";

async function bootstrap(): Promise<void> {
  if (!shouldTrace) return;

  const { isReactTracerInitialized, reactTracer } =
    await import("@autotracer/react19");

  if (!isReactTracerInitialized()) {
    reactTracer({ enabled: false });
  }
}

void bootstrap();
```

The Dashboard is a separate package and is not mounted by this Babel plugin. In internal browser applications without the Dashboard, use `globalThis.autoTracer` for runtime control.

## Building And Testing

Run repository-defined scripts from the monorepo root:

```bash
pnpm build
pnpm test
pnpm verify
```

The package build checks source compatibility with TypeScript 6, emits JavaScript and declarations with TypeScript 7, and bundles the emitted JavaScript as CommonJS with Rollup. A TypeScript 6 consumer fixture compiles against the emitted declarations. Coverage uses Vitest 4.1.10 with 80% global branch, function, line, and statement thresholds.

## License

MIT © Carl Ribbegårdh
