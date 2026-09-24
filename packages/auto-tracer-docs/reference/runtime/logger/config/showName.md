# `showName`

**Package:** `@autotracer/logger` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `true`

---

`showName` is the named-logger visibility setting changed through `logger.setShowName(show)`.

When it is `true`, the logger name is prepended to output as `[name] `. When it is `false`, the name prefix is omitted.

This setting affects the named logger path only. The standalone global logging functions do not carry a logger name and do not expose an equivalent setting.

## Usage

```typescript
import { getLogger } from "@autotracer/logger";

const logger = getLogger("payment");

logger.setShowName(false);
logger.info("Authorized payment");
```
