# `exclude`

**Package:** `@autotracer/plugin-vite-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `{ paths?: string[]; components?: Array<string | RegExp> }` &nbsp;·&nbsp; **Default:** test files, test folders, `node_modules`, `dist`, `build`, `.next`, and `coverage`

---

`exclude` is a build configuration option for `reactTracer.vite()`. It removes files and component names from the eligible set before pragma rules and `mode` fallback are applied.

- `paths` excludes files by glob pattern
- `components` excludes component names by exact string, glob-like string, or regular expression

The default path exclusions are:

```txt
**/*.test.*
**/*.spec.*
**/node_modules/**
**/dist/**
**/build/**
**/.next/**
**/coverage/**
**/tests/**
**/test/**
**/__tests__/**
```

The plugin normalizes this option through `@autotracer/inject-react19`, so nested fields are deep-merged with the defaults.

## Usage

```ts
reactTracer.vite({
  exclude: {
    components: [/^Internal/, "DebugPanel"],
  },
});
```
