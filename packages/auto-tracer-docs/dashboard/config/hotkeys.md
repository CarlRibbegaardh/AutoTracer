# `hotkeys`

**Package:** `@autotracer/dashboard` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Initializer:** `mountDashboard(config?)` &nbsp;·&nbsp; **Type:** `object`

---

`hotkeys` is a configuration field in the `DashboardConfig` shape used by `mountDashboard(config?)` in `@autotracer/dashboard` and reused by the Vite-plugin `dashboardConfig` setting. It configures the global keyboard shortcuts used by the dashboard widget.

The default shortcuts are `Alt+Shift+T` for tracing on and off, and `Alt+Shift+D` for showing and hiding the widget.

`toggleTracing` applies to whichever tracer runtimes are present in the page. When it starts any tracer, the dashboard marks itself as shown and becomes visible. `toggleDashboard` changes widget visibility only.

The dashboard ignores these hotkeys while focus is inside an `input`, `textarea`, or `contenteditable` element.

## Fields

- `toggleTracing`: key chord for starting or stopping the available tracers. Default `"Alt+Shift+T"`.
- `toggleDashboard`: key chord for showing or hiding the widget. Default `"Alt+Shift+D"`.

Use `Ctrl`, `Shift`, and `Alt` segments plus a final key segment, such as `"Ctrl+Shift+T"`.

## Usage

```typescript
mountDashboard({
  hotkeys: {
    toggleTracing: "Ctrl+Shift+T",
    toggleDashboard: "Ctrl+Shift+D",
  },
});
```
