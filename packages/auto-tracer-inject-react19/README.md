# @autotracer/inject-react19

## Overview

`@autotracer/inject-react19` is the shared low-level transform package behind the React 19 ReactTracer build plugins. It is for tool authors who need direct control over the AST transform instead of using the Vite or Babel integration packages.

## Why Use It

This package exposes the shared transform pipeline directly. That gives custom tooling access to `transform()`, `normalizeConfig()`, the shared eligibility helpers, and the shared config model without having to reimplement React component detection and hook-label injection yourself.

## Requirements

- Node.js 24 for repository development and package tooling
- TypeScript 6 or newer for TypeScript consumers
- Babel 7 parser and AST packages supplied through this package's dependencies

## Installation

```bash
pnpm add -D @autotracer/inject-react19
```

Most app integrations should use `@autotracer/plugin-vite-react19` or `@autotracer/plugin-babel-react19` instead.

## Configuration

Start from `normalizeConfig()` so the shared defaults are applied before you call `transform()`:

```typescript
import { normalizeConfig } from "@autotracer/inject-react19";

const config = normalizeConfig({
  mode: "opt-out",
});
```

Use these documentation pages for exact behavior:

- Shared transform overview: https://docs.autotracer.dev/reference/build/react19/inject/
- Shared transform API: https://docs.autotracer.dev/api/inject-react19
- `mode`: https://docs.autotracer.dev/reference/build/react19/inject/config/mode
- `include`: https://docs.autotracer.dev/reference/build/react19/inject/config/include
- `exclude`: https://docs.autotracer.dev/reference/build/react19/inject/config/exclude
- `serverComponents`: https://docs.autotracer.dev/reference/build/react19/inject/config/serverComponents
- `importSource`: https://docs.autotracer.dev/reference/build/react19/inject/config/importSource
- `labelHooks`: https://docs.autotracer.dev/reference/build/react19/inject/config/labelHooks
- `labelHooksPattern`: https://docs.autotracer.dev/reference/build/react19/inject/config/labelHooksPattern

This package does not initialize `reactTracer()`, does not expose `globalThis.autoTracer`, and does not load theme files.

## Usage

Use the shared transform directly only in custom tooling:

```typescript
import { normalizeConfig, transform } from "@autotracer/inject-react19";

const config = normalizeConfig({
  mode: "opt-out",
  labelHooks: ["useSelector"],
});

const result = transform(sourceCode, {
  filename: "Widget.tsx",
  config,
  prefix: "ShellA",
});
```

Use `prefix` when multiple islands, micro-frontends, or other independent React entry points share one browser tab and you need injected component names to stay distinguishable as `prefix:ComponentName`.

For the exported helper surface and type shapes, use the package API page:

- https://docs.autotracer.dev/api/inject-react19

For normal app integrations, use these packages instead:

- Vite path: https://docs.autotracer.dev/api/plugin-vite-react19
- Babel path: https://docs.autotracer.dev/api/plugin-babel-react19

## Building And Testing

Run repository-defined scripts from the monorepo root:

```bash
pnpm build
pnpm test
pnpm verify
```

The package emits ESM and CommonJS builds with TypeScript 7, checks source with TypeScript 6, and compiles a TypeScript 6 consumer fixture against the emitted declarations.

## License

MIT © Carl Ribbegårdh
