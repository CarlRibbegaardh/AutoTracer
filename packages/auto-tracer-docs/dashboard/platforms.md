# Platform Guidance

Whether the dashboard is the right default depends on the runtime surface, not the product label.

## Recommended Split

| Runtime surface                                                                   | Recommended control surface                        | Dashboard role                                            |
| --------------------------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| Standard browser web app                                                          | Dashboard                                          | Default runtime control surface for targeted tracing      |
| Browser app with limited log visibility, such as some mobile or embedded surfaces | Dashboard plus a platform-specific log access path | Controls capture only; does not make logs visible         |
| Console app, server, CLI, or worker process                                       | Runtime API                                        | Not applicable                                            |
| Hybrid app with both browser and non-browser runtimes                             | Per-surface choice                                 | Use the dashboard only where a browser UI actually exists |

## Browser Surfaces

In browser-based apps, the dashboard is the preferred way to start dormant, target a narrow capture window, and stop quickly.

For the normal browser workflow, see [Dashboard For Web Apps](/dashboard/webapps). For manual mounting, widget controls, and package-side dashboard settings, see [Dashboard Package Reference](/dashboard/reference).

That recommendation still assumes the host platform gives you a practical way to inspect the output written by the tracer.

If it does not, the dashboard remains useful for control, but not for visibility.

When the dashboard is not mounted in a browser runtime, use the lower-level runtime control surface on `globalThis.autoTracer` instead. The concrete public runtime APIs are documented on [@autotracer/react18](/api/react18) and [@autotracer/flow](/api/flow).

## Non-Browser Surfaces

For console apps, servers, CLIs, and native runtimes without a browser DOM, use the runtime APIs directly.

The dashboard is a browser widget. If there is no browser UI, there is no dashboard surface to mount.

## Hybrid Apps

Treat each runtime separately.

- Browser renderer or webview surface: dashboard guidance applies.
- Main process, backend process, worker, or CLI surface: runtime API guidance applies.

## Read Next

- [Dashboard For Web Apps](/dashboard/webapps) for the recommended browser tracing workflow
- [Dashboard Package Reference](/dashboard/reference) for `mountDashboard(...)`, `globalThis.autoTracer.widget`, and package-side dashboard settings
- [@autotracer/react18](/api/react18) for the lower-level React runtime control API
- [@autotracer/flow](/api/flow) for the lower-level Flow runtime control API
