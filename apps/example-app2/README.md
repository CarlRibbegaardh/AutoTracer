# example-app2

**Simple Vite + React example demonstrating ReactTracer integration.**

This is a minimal example app showing how to use `@autotracer/react18` with the Vite plugin for automatic component tracing.

## What This Demonstrates

- Basic ReactTracer initialization
- Vite plugin configuration for automatic hook injection
- State and prop change tracking in action

## Running

```bash
# From repository root
pnpm --filter example-app2 dev

# Then open http://localhost:5173 (or the port shown in console)
```

## Configuration

See `vite.config.ts` for the ReactTracer Vite plugin setup.

The plugin is configured with:

- `inject: true` - Automatic hook injection enabled
- `mode: "opt-out"` - All components traced by default

## Development

```bash
# Build
pnpm --filter example-app2 build

# Preview production build
pnpm --filter example-app2 preview
```

## License

MIT © Carl Ribbegårdh
