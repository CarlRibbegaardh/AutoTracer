# todo-example-suite-vite6

**Vite 6 test suite with both React18 and Flow tracing enabled.**

## Overview

A minimal test application for validating AutoTracer integrations with Vite 6, testing both React component render tracing and function flow tracing in a single unified setup.

## Why Use It

This test suite verifies that both `@autotracer/react18` and `@autotracer/flow` can coexist in a Vite 6 project with minimal configuration. It serves as a compatibility verification tool to ensure the tracing libraries work correctly together across different Vite versions.

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

### Port

- Dev: `5202`
- Preview: `5202`

See [docs/local.ports.md](../../docs/local.ports.md) for the full port allocation map.

## Usage

### Development

```bash
pnpm --filter todo-example-suite-vite6 dev
```

### Build

```bash
pnpm --filter todo-example-suite-vite6 build
```

### Preview

```bash
pnpm --filter todo-example-suite-vite6 preview
```

## Testing

### E2E Tests

Run Playwright tests:

```bash
pnpm --filter todo-example-suite-vite6 test:e2e
```

The test suite verifies:

- App loads in dev mode
- App loads in preview mode (after build)
- Basic interaction (adding a todo item)

## What This Tests

- ✅ Vite 6 compatibility
- ✅ React component render tracing
- ✅ Function flow tracing
- ✅ Both tracers working together
- ✅ Dev and production builds

## License

MIT © Carl Ribbegårdh
