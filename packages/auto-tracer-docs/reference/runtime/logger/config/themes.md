# `themes`

**Package:** `@autotracer/logger` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `object`

---

`themes` is the exported preset collection from `@autotracer/logger`. Use it when you want a complete `Theme` object for `logger.setTheme(theme)` or `setTheme(theme)`.

The built-in presets are:

- `themes.default` for the empty default theme
- `themes.minimal` for text prefixes without colors
- `themes.emoji` for emoji prefixes plus colors
- `themes.monochrome` for ASCII-style prefixes without colors

Setting one of these presets replaces the current theme configuration, because `setTheme(...)` replaces the entire current theme.

## Usage

```typescript
import { setTheme, themes } from "@autotracer/logger";

setTheme(themes.monochrome);
```