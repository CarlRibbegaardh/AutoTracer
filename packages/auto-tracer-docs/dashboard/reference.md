# Dashboard Package Reference

`@autotracer/dashboard` is the browser widget package for controlling AutoTracer at runtime.

Install it when you want an in-app control surface for browser-based tracing workflows.

```bash
pnpm add -D @autotracer/dashboard
```

## Public Surface

`@autotracer/dashboard` exposes these package-level runtime surfaces:

- `mountDashboard(config?)`
- `DashboardConfig`
- `DashboardPosition`
- `HotkeyConfig`
- `WidgetControls`

The package does not export a `dashboardConfig` runtime initializer. `dashboardConfig` is the adjacent build-time setting used by the Vite plugins, and it reuses the `DashboardConfig` shape documented here.

## Adjacent Build-Time Surface: `dashboardConfig`

Both Vite plugins can inject dashboard configuration into the page when tracer injection is enabled.

```typescript
interface DashboardConfig {
  enabled: boolean;
  hideByDefault: boolean;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  hotkeys: {
    toggleTracing: string;
    toggleDashboard: string;
  };
}
```

`dashboardConfig` controls widget mounting and presentation.

This setting is owned by the Vite plugin packages, not by `@autotracer/dashboard` itself.

- [`enabled`](./config/enabled) when `false`, the dashboard is not injected (Vite path) or does not mount (manual path). Equivalent to omitting `dashboardConfig` on the Vite path.
- [`hideByDefault`](./config/hideByDefault) only affects the first unseen load; a saved shown-before state overrides it later.
- [`position`](./config/position) places the widget in one of the four fixed screen corners.
- [`hotkeys`](./config/hotkeys) configures the shared toggle shortcuts.

## `mountDashboard(config?)`

Use `mountDashboard(...)` when you want to mount the widget manually instead of relying on plugin injection.

```typescript
function mountDashboard(config?: Partial<DashboardConfig>): void;
```

```typescript
import { mountDashboard } from "@autotracer/dashboard";

mountDashboard({
  hideByDefault: true,
  position: "bottom-left",
});
```

`mountDashboard(...)` merges dashboard configuration in this order:

1. Runtime `config` passed to `mountDashboard(...)`
2. Vite-plugin injected `globalThis.__autoTracerDashboardConfig`
3. Built-in defaults

Runtime configuration passed to `mountDashboard(...)` overrides any plugin-injected dashboard configuration.

The current built-in defaults are:

- `enabled: true` (set `false` to suppress the widget; equivalent to not calling `mountDashboard(...)` at all)
- `hideByDefault: true`
- `position: "bottom-right"`
- `hotkeys.toggleTracing: "Alt+Shift+T"`
- `hotkeys.toggleDashboard: "Alt+Shift+D"`

Duplicate mounts are ignored, which makes the widget safe to use in islands and microfrontend browser setups.

The duplicate-mount guard is based on `globalThis.autoTracer.widget`. Once one dashboard mount path succeeds, later `mountDashboard(...)` calls return without remounting or replacing the widget.

The dashboard can mount before ReactTracer or FlowTracer is initialized. After mounting, the widget keeps polling for tracer availability and updates when those runtimes appear later in the page lifecycle.

The widget exposes one version-neutral `React` tab. It controls `globalThis.autoTracer.reactTracer` whether that surface comes from `@autotracer/react18` or `@autotracer/react19`. Mixed React 18 and React 19 pages still use this single shared control.

## `globalThis.autoTracer.widget`

After mounting, the widget exposes browser controls on `globalThis.autoTracer.widget`.

```typescript
interface WidgetControls {
  show(): void;
  hide(): void;
  toggle(): void;
  isVisible(): boolean;
  unregisterHotkeys(): void;
}
```

These methods control the widget only. They do not replace the tracer runtime APIs.

### `show()`

Shows the widget immediately.

This changes only current visibility. It does not persist the shown-before state used by [`hideByDefault`](./config/hideByDefault).

### `hide()`

Hides the widget immediately.

This changes only current visibility. It does not clear the shown-before state that may already be saved from an earlier tracing session.

### `toggle()`

Flips the current widget visibility.

Like `show()` and `hide()`, this affects only the current page state.

### `isVisible()`

Returns the widget's current visibility state.

This reports whether the widget is currently shown, not whether it was shown in a previous browser session.

### `unregisterHotkeys()`

Removes the dashboard's registered keyboard shortcuts from the current page.

This does not unmount the widget and it does not stop or start any tracer. It only disables the dashboard-managed document keydown listener.

## What The Widget Surfaces

When ReactTracer is present, the widget can control:

- Start and stop.
- Enable on load.
- Auto-stop after a render count.
- Start trigger.
- End trigger.
- End-trigger timing.
- Trigger re-arm mode.

When FlowTracer is present, the widget can control:

- Start and stop.
- Enable on load.
- Auto-stop after top-level function counts.
- Auto-stop after total function counts.
- Start trigger.
- End trigger.
- End-trigger timing.
- Trigger re-arm mode.

When both tracers are present in the same browser runtime, the shared toggle hotkey can start or stop both.

## Mount Order

The dashboard can mount before the tracer runtimes initialize.

After mounting, it polls for tracer availability and updates the widget when ReactTracer or FlowTracer appears later in the page lifecycle.

## Limits

- The widget is a browser control surface, not a trace-output viewer.
- It does not make console or DevTools access available on platforms that do not already expose that access.
- In React apps, it does not replace the `reactTracer(...)` bootstrap.

For the recommended browser workflow, see [Dashboard For Web Apps](/dashboard/webapps).
