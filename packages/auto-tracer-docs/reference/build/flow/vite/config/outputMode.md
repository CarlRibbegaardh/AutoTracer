# `outputMode`

**Package:** `@autotracer/plugin-vite-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `"devtools" | "copy-paste"` &nbsp;·&nbsp; **Default:** `undefined`

---

`outputMode` is a build configuration option for `flowTracer()` — the Vite plugin initializer of the `@autotracer/plugin-vite-flow` Flow build-time instrumentation package. It chooses the trace output format FlowTracer starts with.

Use [@autotracer/flow](/api/flow) when you need to change output mode later at runtime.

## Default

If you omit `outputMode`, FlowTracer starts in `"devtools"`.

## Values

- `"devtools"`: interactive console grouping through the browser's native grouping behavior.
- `"copy-paste"`: text output shaped for copying into bug reports, chat, or documents.

## Usage

```typescript
flowTracer({
  outputMode: "devtools",
});
```
