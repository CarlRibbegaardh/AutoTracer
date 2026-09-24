# `exclude`

**Package:** `@autotracer/inject-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `object` &nbsp;·&nbsp; **Default:** `{ paths: ["**/*.test.*", "**/*.spec.*", "**/node_modules/**", "**/dist/**", "**/build/**", "**/.next/**", "**/coverage/**", "**/tests/**", "**/test/**", "**/__tests__/**"], components: [] }`

---

`exclude` is a shared transform configuration option used by the file and component eligibility checks before `transform()` injects anything. It removes files or component names from the eligible set.

The object is deep-merged with the default config. If you add `components`, the default excluded paths stay in place unless you replace `paths` explicitly.

## Fields

- `paths`: file patterns skipped before transformation
- `components`: component names or patterns skipped inside otherwise eligible files

File-level exclusion is checked before the transform runs at all. Component-level exclusion is absolute inside the eligible file set: if a component matches `exclude.components`, `// @trace` does not force it back in.

## Usage

```typescript
import { normalizeConfig } from "@autotracer/inject-react18";

const config = normalizeConfig({
  exclude: {
    components: [/^Internal/, "DebugPanel"],
  },
});
```

Read together with [`include`](./include) and [`mode`](./mode) because eligibility is resolved before pragma and mode fallback behavior.
