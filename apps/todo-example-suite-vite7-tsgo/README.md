# todo-example-suite-vite7-tsgo

**Vite 7 test suite with TypeScript Go compiler and both React18 and Flow tracing enabled.**

## Overview

A minimal test application for validating AutoTracer integrations with Vite 7 and the TypeScript Go compiler (`@typescript/native-preview`), testing both React component render tracing and function flow tracing with native TypeScript compilation.

## Why Use It

This test suite verifies that both `@autotracer/react18` and `@autotracer/flow` can coexist in a Vite 7 project using the experimental TypeScript Go compiler. It ensures compatibility with Microsoft's native TypeScript implementation, which offers significantly faster compilation times.

## Installation

From the repository root:

```bash
pnpm install
```

## Configuration

### Vite Plugins

Both tracing plugins are configured in [vite.config.ts](vite.config.ts):

- **React18 Tracer**: Tracks component renders with opt-out mode
- **Flow Tracer**: Tracks function entry/exit for all TypeScript files

### TypeScript Compiler

Uses `@typescript/native-preview` instead of the standard TypeScript compiler for faster build times.

### Port

- Dev: `5205`
- Preview: `5205`

See [docs/local.ports.md](../../docs/local.ports.md) for the full port allocation map.

## Usage

### Development

```bash
pnpm --filter todo-example-suite-vite7-tsgo dev
```

### Build

```bash
pnpm --filter todo-example-suite-vite7-tsgo build
```

### Preview

```bash
pnpm --filter todo-example-suite-vite7-tsgo preview
```

## Testing

### E2E Tests

Run Playwright tests:

```bash
pnpm --filter todo-example-suite-vite7-tsgo test:e2e
```

The test suite verifies:

- App loads in dev mode
- App loads in preview mode (after build)
- Basic interaction (adding a todo item)

## What This Tests

- ✅ Vite 7 compatibility
- ✅ TypeScript Go compiler compatibility
- ✅ React component render tracing
- ✅ Function flow tracing
- ✅ Both tracers working together with native TS compiler
- ✅ Dev and production builds

## License

MIT © Carl Ribbegårdh
