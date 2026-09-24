# @autotracer/logger

`@autotracer/logger` is primarily an internal shared utility package used by AutoTracer runtimes, build tooling, and the manual `createFlowTracer(logger, config?)` path.

For the unlikely cases where this package is used directly, `getLogger(name)` is the preferred path; the standalone logging functions share one global logger state.

## Public Surface Inventory

This package exports these public surfaces:

- Named logger factory: `getLogger(name)`
- Logger instance methods for per-instance configuration, log output, grouping, and timing: `setLogLevel(...)`, `setTheme(...)`, `setGroupMode(...)`, `setShowName(...)`, `fatal(...)`, `error(...)`, `warn(...)`, `log(...)`, `info(...)`, `debug(...)`, `verbose(...)`, `trace(...)`, `group(...)`, `groupEnd()`, `enter(...)`, `exit(...)`, `enterStyled(...)`, and `exitStyled(...)`
- Standalone global functions for shared-state log output, grouping, timing, and state access: `fatal(...)`, `error(...)`, `warn(...)`, `log(...)`, `info(...)`, `debug(...)`, `verbose(...)`, `trace(...)`, `group(...)`, `groupEnd()`, `enter(...)`, `exit(...)`, `setLogLevel(...)`, `getLogLevel()`, `setTheme(...)`, `getTheme()`, `setGroupMode(...)`, and `getGroupMode()`
- Theme presets: `themes.default`, `themes.minimal`, `themes.emoji`, and `themes.monochrome`
- Types: `Logger`, `LogLevel`, `GroupMode`, `Theme`, `ExitHandle`, and `StyledExitHandle`

This package does not expose any build-time settings, runtime initializer settings, `globalThis.autoTracer` APIs, or theme-file discovery surface.

## Installation

```bash
pnpm add @autotracer/logger
```

`@autotracer/logger` is already installed transitively by `@autotracer/flow`. Install it directly when you use the logger package outside that path.

## Named Logger API

`getLogger(name)` returns one cached logger instance for that exact, case-sensitive name.

Use this path when you need one logger with its own `logLevel`, `theme`, `groupMode`, and `showName` state. Calling `getLogger("payment")` again returns the same instance, so configuration and open timing/group state are reused across those call sites.

Named logger instances expose three capability groups:

- Per-instance configuration: `setLogLevel(...)`, `setTheme(...)`, `setGroupMode(...)`, and `setShowName(...)`
- Output methods: `fatal(...)`, `error(...)`, `warn(...)`, `log(...)`, `info(...)`, `debug(...)`, `verbose(...)`, and `trace(...)`
- Grouping and timing helpers: `group(...)`, `groupEnd()`, `enter(...)`, `exit(...)`, `enterStyled(...)`, and `exitStyled(...)`

```typescript
import { getLogger, themes } from "@autotracer/logger";

const logger = getLogger("payment");

logger.setLogLevel("debug");
logger.setTheme(themes.minimal);
logger.setGroupMode("text");
logger.setShowName(true);

const handle = logger.enter("chargeCard");
logger.info("Authorizing payment", { amount: 42 });
logger.exit(handle);
```

Use `enterStyled(...)` and `exitStyled(...)` only when you need to supply already-styled labels while still keeping the raw label for timing and slow-call warnings.

## Standalone Global API

The standalone functions share one module-level logger state.

Use this path when you want logger output without creating a named logger instance. `setLogLevel(...)`, `setTheme(...)`, and `setGroupMode(...)` update that shared state, and `getLogLevel()`, `getTheme()`, and `getGroupMode()` read it.

This path does not expose `setShowName(...)`, `enterStyled(...)`, or `exitStyled(...)` because there is no named logger instance.

```typescript
import {
  group,
  groupEnd,
  info,
  setGroupMode,
  setLogLevel,
  setTheme,
  themes,
  warn,
} from "@autotracer/logger";

setLogLevel("info");
setTheme(themes.monochrome);
setGroupMode("text");

group("Startup");
info("Booting application");
warn("Low disk space");
groupEnd();
```

## Adjacent Configuration Surface

Use [Logger Configuration Surfaces](/reference/runtime/logger/) for the exact behavior of the logger's exported configuration surfaces.

- [`logLevel`](/reference/runtime/logger/config/logLevel) for verbosity on the named and global logger paths
- [`groupMode`](/reference/runtime/logger/config/groupMode) for `console.group()` versus UTF-8 text grouping
- [`theme`](/reference/runtime/logger/config/theme) for replacing the current theme configuration
- [`showName`](/reference/runtime/logger/config/showName) for the named-logger name prefix toggle
- [`themes`](/reference/runtime/logger/config/themes) for the built-in preset `Theme` objects

The named logger path and the standalone global path keep separate configuration state. Changing one does not update the other.

See [Logger Configuration Surfaces](/reference/runtime/logger/) for the canonical settings index.

## What This Package Does Not Export

The current package barrel does not export these surfaces:

- a `logger` object
- `formatValue(...)`
- `serializeObject(...)`
- `indent(...)`
- `treeChars`

The source also does not expose environment-variable configuration for log level or theme.

## Related Packages

- [@autotracer/flow](./flow) for the manual `createFlowTracer(logger, config?)` path that accepts a `Logger`
- [@autotracer/react18](./react18) for a package that uses the logger internally
- [@autotracer/plugin-vite-flow](./plugin-vite-flow) and [@autotracer/plugin-vite-react18](./plugin-vite-react18) for build tooling that also depends on the logger package
