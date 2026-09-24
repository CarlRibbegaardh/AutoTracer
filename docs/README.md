# AutoTracer

AutoTracer is a TypeScript monorepo for development-time tracing across three areas:

- selected function execution tracing;
- React render, state, and prop tracing; and
- browser network tracing.

AutoTracer is intended for local development and access-restricted internal test and QA environments. Public artifacts must exclude tracing at build time. Runtime start and stop switches are operational controls, not security boundaries.

## Tracer Areas

### FlowTracer

FlowTracer captures selected function execution with call order, inputs, outputs, and thrown errors.

### ReactTracer (React 18 and React 19)

ReactTracer observes React through the DevTools hook and reports render cycles together with labeled state and prop changes. The runtime and plugin versions must match your React major.

### NetworkTracer (implementation status)

`@autotracer/network` is under active implementation. It does not expose a supported runtime API yet, and it should not be installed in application runtimes at this stage.

## Package Ownership

Packages are deliverables. Apps under `apps/` are examples and integration fixtures for validating those deliverables.

| Area                    | Packages                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Flow tracing            | [@autotracer/flow](../packages/auto-tracer-flow/README.md), [@autotracer/plugin-vite-flow](../packages/auto-tracer-plugin-vite-flow/README.md), [@autotracer/plugin-babel-flow](../packages/auto-tracer-plugin-babel-flow/README.md)                                                                                                                                                                                 |
| React 18 tracing        | [@autotracer/react18](../packages/auto-tracer-react18/README.md), [@autotracer/plugin-vite-react18](../packages/auto-tracer-plugin-vite-react18/README.md), [@autotracer/plugin-babel-react18](../packages/auto-tracer-plugin-babel-react18/README.md), [@autotracer/inject-react18](../packages/auto-tracer-inject-react18/README.md), [@autotracer/react18-proof](../packages/auto-tracer-react18-proof/README.md) |
| React 19 tracing        | [@autotracer/react19](../packages/auto-tracer-react19/README.md), [@autotracer/plugin-vite-react19](../packages/auto-tracer-plugin-vite-react19/README.md), [@autotracer/plugin-babel-react19](../packages/auto-tracer-plugin-babel-react19/README.md), [@autotracer/inject-react19](../packages/auto-tracer-inject-react19/README.md), [@autotracer/react19-proof](../packages/auto-tracer-react19-proof/README.md) |
| Shared support          | [@autotracer/dashboard](../packages/auto-tracer-dashboard/README.md), [@autotracer/logger](../packages/auto-tracer-logger/README.md), [@autotracer/filter-utils](../packages/auto-tracer-filter-utils/README.md)                                                                                                                                                                                                     |
| Browser network tracing | [@autotracer/network](../packages/auto-tracer-network/README.md) (active implementation, no supported runtime API yet)                                                                                                                                                                                                                                                                                               |

## Docs Site Quick Links

- [Your first trace](https://docs.autotracer.dev/guide/first-trace)
- [Flow quickstart](https://docs.autotracer.dev/guide/quickstart-flow)
- [React 19 quickstart](https://docs.autotracer.dev/guide/quickstart-react19)
- [React 18 quickstart](https://docs.autotracer.dev/guide/quickstart-react)
- [Use with agents](https://docs.autotracer.dev/guide/agents)

## Repository Documentation

- [Flow high-level spec](./auto-tracer-flow-spec-highlevel.md)
- [React high-level spec](./auto-tracer-react-spec-highlevel.md)
- [Design notes](./design)
- [Developer docs](./dev)
- [Contributor setup](./dev/contributor-setup.md)
- [Docs site source package](../packages/auto-tracer-docs/README.md)
- [Local agent skills](../skills/README.md)

The `docs/work` tree is internal working documentation that is maintained separately from public documentation content.

## Local Setup

Use Node.js 24 with Corepack and pnpm 10.18.3.

```bash
corepack enable
corepack install
pnpm install
pnpm verify
```

## Community And License

- GitHub Issues: https://github.com/CarlRibbegaardh/AutoTracer/issues
- GitHub Discussions: https://github.com/CarlRibbegaardh/AutoTracer/discussions
- Docs site: https://docs.autotracer.dev
- License: MIT (see [package.json](../package.json))
