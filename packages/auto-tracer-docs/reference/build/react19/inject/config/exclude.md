# `exclude`

**Package:** `@autotracer/inject-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `{ paths?: string[]; components?: Array<string | RegExp> }` &nbsp;·&nbsp; **Default:** test files, test folders, `node_modules`, `dist`, `build`, `.next`, and `coverage`

---

`exclude` is a shared transform configuration option used by `normalizeConfig()` and `transform()`. It removes files and component names from the eligible set before pragma rules and `mode` fallback are applied.

`normalizeConfig()` deep-merges this option with the default configuration.

## Usage

```ts
import { normalizeConfig } from "@autotracer/inject-react19";

const config = normalizeConfig({
  exclude: {
    components: [/^Internal/, "DebugPanel"],
  },
});
```
