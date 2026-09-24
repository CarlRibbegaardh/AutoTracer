# `position`

**Package:** `@autotracer/dashboard` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Initializer:** `mountDashboard(config?)` &nbsp;·&nbsp; **Type:** `"bottom-right" | "bottom-left" | "top-right" | "top-left"` &nbsp;·&nbsp; **Default:** `"bottom-right"`

---

`position` is a configuration field in the `DashboardConfig` shape used by `mountDashboard(config?)` in `@autotracer/dashboard` and reused by the Vite-plugin `dashboardConfig` setting. It chooses which screen corner receives the floating dashboard widget.

Changing this setting only changes the fixed corner class applied to the widget. The widget keeps the same fixed-corner layout behavior and the same offset from the chosen screen edge.

## Values

- `"bottom-right"`
- `"bottom-left"`
- `"top-right"`
- `"top-left"`

## Usage

```typescript
mountDashboard({
  position: "top-left",
});
```
