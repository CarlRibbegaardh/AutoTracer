# `importSource`

**Package:** `@autotracer/plugin-vite-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** `"@autotracer/react19"`

---

`importSource` is a build configuration option for `reactTracer.vite()`. It changes the module specifier used for injected `useReactTracer` and `labelState` imports.

Leave the default when the runtime comes from `@autotracer/react19`. Override it only when you intentionally route the injected imports through a custom wrapper.

## Usage

```ts
reactTracer.vite({
  importSource: "@autotracer/react19",
});
```
