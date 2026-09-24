# `theme`

**Package:** `@autotracer/logger` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `Theme` &nbsp;·&nbsp; **Default:** `themes.default`

---

`theme` is the visual styling setting used by named loggers through `logger.setTheme(theme)` and by the standalone global logger state through `setTheme(theme)`.

This setting replaces the current theme configuration. It does not merge into the previous theme.

The named logger path and the standalone global path keep separate theme state. Changing one does not update the other.

Use the exported preset collection on [`themes`](./themes) when you want a complete `Theme` object without constructing one yourself.

## Usage

```typescript
import { getLogger, themes } from "@autotracer/logger";

const logger = getLogger("payment");

logger.setTheme(themes.minimal);
```
