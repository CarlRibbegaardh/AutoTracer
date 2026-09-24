# API Reference

Choose the runtime or build integration you are using. ReactTracer packages must match your application's React major.

| Signal | Runtime | Vite plugin | Babel plugin |
| --- | --- | --- | --- |
| Function execution | [FlowTracer](/api/flow) | [Flow Vite](/api/plugin-vite-flow) | [Flow Babel](/api/plugin-babel-flow) |
| React 18 renders and state | [React 18](/api/react18) | [React 18 Vite](/api/plugin-vite-react18) | [React 18 Babel](/api/plugin-babel-react18) |
| React 19 renders and state | [React 19](/api/react19) | [React 19 Vite](/api/plugin-vite-react19) | [React 19 Babel](/api/plugin-babel-react19) |

For shared transforms, see [React 18 injection](/api/inject-react18) and [React 19 injection](/api/inject-react19). Browser controls are documented in the [Dashboard reference](/dashboard/reference); shared logging is documented in [Logger](/api/logger).

Start with [Your First Trace](/guide/first-trace) to run a scenario, or [Capture Workflows](/guide/capture/) if AutoTracer is already installed. Use [Runtime Settings](/reference/runtime/) for configuration defaults and option behavior.
