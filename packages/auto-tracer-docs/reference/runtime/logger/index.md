# Logger Configuration Surfaces

**Package:** `@autotracer/logger` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** Overview

---

Use these pages for the exact behavior of the configuration surfaces exposed by `@autotracer/logger`.

This package does not have a runtime initializer or a `globalThis.autoTracer` surface. These pages describe the configuration used by named logger instances returned from `getLogger(name)` and by the shared global logger functions.

## Public Surface

- [`logLevel`](./config/logLevel)
- [`groupMode`](./config/groupMode)
- [`theme`](./config/theme)
- [`showName`](./config/showName)
- [`themes`](./config/themes)

## Settings By Concern

- Verbosity: [`logLevel`](./config/logLevel)
- Output structure: [`groupMode`](./config/groupMode)
- Visual styling: [`theme`](./config/theme) and [`themes`](./config/themes)
- Named logger prefix visibility: [`showName`](./config/showName)

## Adjacent Docs

- [@autotracer/logger](/api/logger) for package usage and the full exported API
- [@autotracer/flow](/api/flow) for the manual `createFlowTracer(logger, config?)` path that accepts a `Logger`
