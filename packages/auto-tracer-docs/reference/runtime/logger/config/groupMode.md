# `groupMode`

**Package:** `@autotracer/logger` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `"default" | "text"` &nbsp;·&nbsp; **Default:** `"default"`

---

`groupMode` is the grouping-mode setting used by named loggers through `logger.setGroupMode(mode)` and by the standalone global logger state through `setGroupMode(mode)`.

`"default"` uses `console.group()` and `console.groupEnd()`. `"text"` emits UTF-8 text indentation and box-drawing style grouping in plain log output.

The named logger path and the standalone global path keep separate grouping-mode state. Changing one does not update the other.

## Usage

```typescript
import { group, groupEnd, info, setGroupMode } from "@autotracer/logger";

setGroupMode("text");

group("Startup");
info("Booting application");
groupEnd();
```
