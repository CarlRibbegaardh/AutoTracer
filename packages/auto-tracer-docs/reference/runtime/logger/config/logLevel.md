# `logLevel`

**Package:** `@autotracer/logger` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `"off" | "fatal" | "error" | "warn" | "log" | "info" | "debug" | "verbose" | "trace"` &nbsp;·&nbsp; **Default:** `"log"`

---

`logLevel` is the shared verbosity setting used by named loggers created with `getLogger(name)` and by the standalone global logger state changed through `setLogLevel(level)`.

This setting decides which messages are emitted. Messages at or below the current level are shown. `"off"` disables output, and `"trace"` is the most verbose level.

The named logger path and the standalone global path keep separate log level state. Changing one does not update the other.

## Usage

```typescript
import { getLogger } from "@autotracer/logger";

const logger = getLogger("payment");

logger.setLogLevel("debug");
```
