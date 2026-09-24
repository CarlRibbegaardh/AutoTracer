# Logger Package Specification

## Overview

A pure, functional logging utility with hierarchical grouping, performance tracking, configurable log levels, and **named logger instances**.

Each logger instance is completely independent with its own configuration (log level, theme, name visibility) and internal state (group nesting, enter/exit stack).

## Log Levels

The logger supports the following levels (in ascending order of verbosity):

1. **fatal** - Unrecoverable errors that terminate execution
2. **error** - Critical failures
3. **warn** - Warning messages
4. **log** - Standard output (default console.log equivalent)
5. **info** - Informational messages
6. **debug** - Debug information
7. **verbose** - Detailed operational information
8. **trace** - Detailed trace information

### Fatal

This is for those "oh no, everything's on fire" moments. When something goes so catastrophically wrong that your app simply can't continue, you use fatal. Think database connection completely dead, critical config file missing, or the kind of errors that make you reach for the restart button. If it logs as fatal, the application is probably about to exit.

### Error

Something broke, but maybe you can limp along. A failed API call, a file that won't open, a null pointer you didn't expect—these are errors. They're serious problems that need attention, but unlike fatal, your app might be able to recover or at least fail gracefully. You'll want to know about these ASAP because they usually mean something's wrong with your code or environment.

### Warn

This is your "heads up" level. Nothing's broken yet, but something's not quite right. Maybe you're using a deprecated API, or a cache miss is happening more often than usual, or a user input looks suspicious. Warnings are like your app tapping you on the shoulder saying "hey, you might want to look at this eventually."

### Log

Your everyday, bread-and-butter logging. "User logged in," "Processing started," "Operation completed"—the kind of stuff you'd want to see in production to know things are running. It's the default console.log equivalent, perfect for tracking normal application flow without drowning in details.

### Info

A bit more chatty than log, but still about normal operations. This is where you'd put context that's helpful but not critical—like "Connected to database," "Loaded 47 items from cache," or "Starting background job #3." In production, you might keep info on or off depending on how much detail you need.

### Debug

Now we're getting into developer territory. This is for information that helps you understand what your code is doing while you're working on it. Variable values, intermediate calculation steps, which branch of an if-statement you took—all the stuff that's incredibly useful when troubleshooting but way too noisy for production.

### Verbose

Even more detailed than debug. Think of this as debug's chatty cousin who won't stop talking. Every little thing that happens gets logged here—loop iterations, individual item processing, granular state changes. It's great when you need to see absolutely everything, but you'll want to turn it off most of the time because it generates a ton of output.

### Trace

The most detailed level we've got. This is where performance tracking lives (like enter/exit), and it's for tracing the exact execution flow through your code. Function entries and exits, execution timing, the complete path through your call stack—trace shows you the journey, not just the destination. Unless you're doing serious performance analysis or debugging a really subtle issue, you probably don't need trace enabled.

## Named Logger Instances

### Overview

The logger uses a **factory/registry pattern** where each logger instance is identified by a unique name and maintains completely independent state.

**Key characteristics:**

- **Lazy creation**: Loggers are created on first access via `getLogger(name)`
- **Singleton per name**: Calling `getLogger('app')` multiple times returns the same instance
- **Independent state**: Each logger has its own log level, theme, name visibility, group stack, and enter/exit stack
- **Identical defaults**: All loggers start with the same default configuration (`level: 'log'`, `theme: themes.default`, `showName: true`)
- **No shared state**: Changing one logger's configuration does not affect other loggers

### Creating/Accessing Loggers

```typescript
getLogger(name: string): Logger
```

Returns a logger instance for the given name. If the logger doesn't exist, it's created with default settings.

**Examples:**

```typescript
import { getLogger } from "@autotracer/logger";

const appLogger = getLogger("app");
const dbLogger = getLogger("database");
const apiLogger = getLogger("api");

// Same name returns same instance
const appLogger2 = getLogger("app");
console.log(appLogger === appLogger2); // true
```

**Logger name restrictions:**

- Any non-empty string is valid
- No reserved names
- Case-sensitive: `getLogger('App')` ≠ `getLogger('app')`

### Logger Instance API

Each logger instance provides the complete logging API:

```typescript
interface Logger {
  // Configuration
  setLogLevel(level: LogLevel): void;
  setTheme(theme: Theme): void;
  setShowName(show: boolean): void;

  // Logging functions (8 levels)
  fatal(message?: unknown, ...optionalParams: unknown[]): void;
  error(message?: unknown, ...optionalParams: unknown[]): void;
  warn(message?: unknown, ...optionalParams: unknown[]): void;
  log(message?: unknown, ...optionalParams: unknown[]): void;
  info(message?: unknown, ...optionalParams: unknown[]): void;
  debug(message?: unknown, ...optionalParams: unknown[]): void;
  verbose(message?: unknown, ...optionalParams: unknown[]): void;
  trace(message?: unknown, ...optionalParams: unknown[]): void;

  // Grouping
  group(label?: string): void;
  groupEnd(): void;

  // Performance tracking
  enter(label: string, level?: LogLevel): ExitHandle;
  exit(handle: ExitHandle): void;
}
```

### Default Configuration

All loggers are created with identical default settings:

```typescript
{
  level: 'log',              // Standard console.log equivalent
  theme: themes.default,     // Plain console output (no colors, no prefixes)
  showName: true,            // Prepend logger name to all output
  groupStack: 0,             // Internal: no active groups
  enterStack: []             // Internal: no active enter/exit pairs
}
```

### Logger Name Visibility

By default, each logger prepends its name to all output for easy identification:

```typescript
const logger = getLogger("database");
logger.log("Connected"); // Output: "[database] Connected"

// Disable name prefix
logger.setShowName(false);
logger.log("Connected"); // Output: "Connected"

// Re-enable
logger.setShowName(true);
logger.log("Connected"); // Output: "[database] Connected"
```

**Name prefix behavior:**

- **Applied to all output**: Logging functions, group labels, enter/exit markers
- **Respects theme styling**: Name prefix appears before theme prefix (if any)
- **Format**: `[name]` with space separator
- **Independent per logger**: Each logger controls its own name visibility

**Output examples with different configurations:**

```typescript
const logger = getLogger("api");

// showName: true, theme: default
logger.error("Failed"); // → "[api] Failed"

// showName: true, theme: emoji
logger.setTheme(themes.emoji);
logger.error("Failed"); // → "[api] 💥 Failed" (colored red)

// showName: false, theme: emoji
logger.setShowName(false);
logger.error("Failed"); // → "💥 Failed" (colored red)

// showName: true, theme: minimal
logger.setShowName(true);
logger.setTheme(themes.minimal);
logger.error("Failed"); // → "[api] [ERROR] Failed"
```

## Per-Logger Configuration

## Per-Logger Configuration

### Log Level Setting

```typescript
logger.setLogLevel(level: LogLevel): void
```

Controls which messages are output **for this logger only**. Only messages at or below the configured level are logged.

**Example:**

```typescript
const appLogger = getLogger("app");
const dbLogger = getLogger("database");

appLogger.setLogLevel("info"); // app: outputs fatal, error, warn, log, info
dbLogger.setLogLevel("trace"); // db: outputs all levels

appLogger.debug("Debug info"); // ❌ No output (debug > info)
dbLogger.debug("Debug info"); // ✅ Outputs "[database] Debug info"
```

**Independence:**

- Changing one logger's level does not affect other loggers
- Each logger maintains its own level setting
- No global/shared log level state

### Theme Setting

```typescript
logger.setTheme(theme: Theme): void
```

Configures visual styling **for this logger only** including colors, prefixes, and grouping style.

**Theme Object:**

```typescript
interface Theme {
  groupMode: "default" | "text"; // 'default' = console.group, 'text' = UTF-8 art
  colors: {
    fatal?: string; // CSS color value (e.g., '#ff0000', 'red', 'rgb(255,0,0)')
    error?: string; // Applied via console.log('%c ...', 'color: VALUE')
    warn?: string;
    log?: string;
    info?: string;
    debug?: string;
    verbose?: string;
    trace?: string;
  };
  prefixes: {
    fatal?: string; // UTF-8 icon or text prefix (prepended to message)
    error?: string;
    warn?: string;
    log?: string;
    info?: string;
    debug?: string;
    verbose?: string;
    trace?: string;
    enter?: string; // For enter() marker
    exit?: string; // For exit() marker
  };
}
```

**Exported Preset Themes:**

Access via `themes` export: `import { themes } from '@autotracer/logger'`

- **`themes.default`** - Console.group, no colors, no prefixes (plain console.log output)
- **`themes.minimal`** - Text grouping, no colors, simple text prefixes (`[FATAL]`, `[ERROR]`, etc.)
- **`themes.emoji`** - Console.group, colorful CSS colors, emoji prefixes (🔥💥⚠️📝ℹ️🐛📊🔍▶️◀️)
- **`themes.monochrome`** - Text grouping, no colors, ASCII art prefixes (`[!]`, `[X]`, `[*]`, etc.)

**Preset Theme Details:**

```typescript
// themes.default - Plain console output
{
  groupMode: "default",
  colors: {},
  prefixes: {}
}

// themes.minimal - Simple text prefixes, text mode grouping
{
  groupMode: "text",
  colors: {},
  prefixes: {
    fatal: "[FATAL]",
    error: "[ERROR]",
    warn: "[WARN]",
    log: "[LOG]",
    info: "[INFO]",
    debug: "[DEBUG]",
    verbose: "[VERBOSE]",
    trace: "[TRACE]",
    enter: "→",
    exit: "←"
  }
}

// themes.emoji - Colorful with emojis, console.group mode
{
  groupMode: "default",
  colors: {
    fatal: "#ff0000",    // Bright red
    error: "#ff4444",    // Red
    warn: "#ffaa00",     // Orange
    log: "#888888",      // Gray
    info: "#00aaff",     // Blue
    debug: "#00ff00",    // Green
    verbose: "#aa00ff",  // Purple
    trace: "#666666"     // Dark gray
  },
  prefixes: {
    fatal: "🔥",
    error: "💥",
    warn: "⚠️",
    log: "📝",
    info: "ℹ️",
    debug: "🐛",
    verbose: "📊",
    trace: "🔍",
    enter: "▶️",
    exit: "◀️"
  }
}

// themes.monochrome - ASCII art, text mode grouping
{
  groupMode: "text",
  colors: {},
  prefixes: {
    fatal: "[!]",
    error: "[X]",
    warn: "[*]",
    log: "[ ]",
    info: "[i]",
    debug: "[d]",
    verbose: "[v]",
    trace: "[t]",
    enter: ">",
    exit: "<"
  }
}
```

Preset themes are plain objects that can be used directly or spread for customization:

```typescript
import { getLogger, themes } from "@autotracer/logger";

const logger = getLogger("app");

// Use preset directly
logger.setTheme(themes.emoji);

// Customize preset
logger.setTheme({ ...themes.emoji, groupMode: "text" });

// Mix presets
logger.setTheme({
  ...themes.emoji,
  colors: themes.monochrome.colors,
});
```

**Independence:**

- Each logger maintains its own theme
- Changing one logger's theme does not affect other loggers
- Multiple loggers can use different themes simultaneously

**Example:**

```typescript
const appLogger = getLogger("app");
const dbLogger = getLogger("database");

appLogger.setTheme(themes.emoji);
dbLogger.setTheme(themes.minimal);

appLogger.error("Failed"); // → "[app] 💥 Failed" (colored red)
dbLogger.error("Failed"); // → "[database] [ERROR] Failed" (no color)
```

**Grouping Modes:**

- **`'default'`** - Uses native `console.group()`/`console.groupEnd()` for collapsible groups
- **`'text'`** - Uses UTF-8 box-drawing characters (├─, └─, │) for tree-like indentation

### Name Visibility Setting

```typescript
logger.setShowName(show: boolean): void
```

Controls whether the logger name is prepended to all output **for this logger only**.

**Default:** `true` (show name)

**Examples:**

```typescript
const logger = getLogger("database");

// Default: showName = true
logger.log("Connected"); // → "[database] Connected"

// Disable name prefix
logger.setShowName(false);
logger.log("Connected"); // → "Connected"

// Re-enable
logger.setShowName(true);
logger.log("Connected"); // → "[database] Connected"
```

**Name prefix format:**

- Appears before all output: logging functions, group labels, enter/exit markers
- Format: `[name]` with space separator
- Combines with theme prefixes: `[name] [THEME_PREFIX] message`
- Independent per logger

## Logger API

## Logger API

### Basic Logging Functions

Each logger instance provides logging functions for all 8 levels:

```typescript
logger.fatal(message?: unknown, ...optionalParams: unknown[]): void
logger.error(message?: unknown, ...optionalParams: unknown[]): void
logger.warn(message?: unknown, ...optionalParams: unknown[]): void
logger.log(message?: unknown, ...optionalParams: unknown[]): void
logger.info(message?: unknown, ...optionalParams: unknown[]): void
logger.debug(message?: unknown, ...optionalParams: unknown[]): void
logger.verbose(message?: unknown, ...optionalParams: unknown[]): void
logger.trace(message?: unknown, ...optionalParams: unknown[]): void
```

**Behavior:**

1. Check if logger's current log level allows output for this level
2. If allowed:
   - Prepend logger name (if `showName` is `true`)
   - Apply theme styling (prefix + color)
   - Call `safeLog()` with formatted message
3. If not allowed, do nothing (no output)

**Name + Theme Application:**

The logger name and theme prefix are combined in order:

1. **Logger name** (if `showName: true`): `[name]`
2. **Theme prefix** (if defined): `[PREFIX]` or emoji
3. **Message**: User's message
4. **Theme color** (if defined): Applied to all of the above via `%c`

**Output patterns:**

```typescript
const logger = getLogger("api");

// showName: true, theme: default (no prefix/color)
logger.error("Failed"); // → "[api] Failed"

// showName: true, theme: minimal (prefix, no color)
logger.setTheme(themes.minimal);
logger.error("Failed"); // → "[api] [ERROR] Failed"

// showName: true, theme: emoji (prefix + color)
logger.setTheme(themes.emoji);
logger.error("Failed"); // → "[api] 💥 Failed" (colored red)

// showName: false, theme: emoji
logger.setShowName(false);
logger.error("Failed"); // → "💥 Failed" (colored red)
```

**Examples:**

```typescript
import { getLogger, themes } from "@autotracer/logger";

const logger = getLogger("app");

// Default theme, name shown
logger.log("Starting"); // → "[app] Starting"

// With emoji theme
logger.setTheme(themes.emoji);
logger.error("Failed to load"); // → "[app] 💥 Failed to load" (colored red)

// Hide name
logger.setShowName(false);
logger.error("Failed to load"); // → "💥 Failed to load" (colored red)
```

All logging internally uses `safeLog()`, a wrapper around `console.log` that prevents exceptions.

### Grouping

```typescript
logger.group(label?: string): void
logger.groupEnd(): void
```

Creates hierarchical indentation for related log messages **within this logger**. Groups can be nested.

**Per-Logger State:**

- Each logger maintains its own group nesting stack
- Groups in one logger do not affect other loggers
- Group depth tracked independently per logger

**Theme Application:**

- **groupMode: "default"** - Uses `console.group(label)` directly
- **groupMode: "text"** - Outputs UTF-8 box-drawing prefix via `safeLog()`

**Name Prefix:**

- If `showName: true`, the logger name appears before the group label
- Format: `[name] label` or `[name] ├─ label` (text mode)

**Grouping Modes:**

- **`'default'`** - Uses `safeGroup()` and `safeGroupEnd()`, wrappers around `console.group`/`console.groupEnd`
- **`'text'`** - Uses UTF-8 box-drawing characters for tree-like structure

**Log Level:** `log` - Groups are structural/organizational, visible when log level ≥ `log`.

**Examples:**

```typescript
const logger = getLogger("app");

// Default mode
logger.group("Processing user data");
logger.log("Loading user...");
logger.log("Validating...");
logger.groupEnd();

// Output (default theme, showName: true):
// ▼ [app] Processing user data
//   [app] Loading user...
//   [app] Validating...

// Text mode
logger.setTheme(themes.minimal);
logger.group("Processing user data");
logger.log("Loading user...");
logger.log("Validating...");
logger.groupEnd();

// Output (minimal theme, showName: true):
// ├─ [app] Processing user data
// │  [app] [LOG] Loading user...
// └─ [app] [LOG] Validating...
```

**Independence:**

```typescript
const appLogger = getLogger("app");
const dbLogger = getLogger("database");

appLogger.group("App Group");
appLogger.log("In app group");

dbLogger.log("Not in any group"); // Independent nesting

appLogger.groupEnd();
```

### Performance Tracking (Enter/Exit)

```typescript
logger.enter(label: string, level?: LogLevel): ExitHandle
logger.exit(handle: ExitHandle): void
```

Tracks execution time and creates hierarchical output **within this logger**.

**Per-Logger State:**

- Each logger maintains its own enter/exit stack
- Enter/exit pairs in one logger do not affect other loggers
- Stack unwinding is scoped to the specific logger

**Default Level:** `trace` - Performance tracking is detailed/verbose logging, naturally fitting the trace level.

**Theme Application:**

- `enter()` uses theme's `prefixes.enter` and `colors[level]` when outputting
- `exit()` uses theme's `prefixes.exit` and `colors[level]` when outputting
- Both respect the `groupMode` setting (console.group vs UTF-8 text)

**Behavior:**

1. `enter(label, level = 'trace')`

   - Checks if current log level allows output at the specified level
   - If allowed:
     - Calls `group(label)` to start indentation (respects theme's groupMode setting)
     - Outputs: `"[enter-prefix] [label]"` with theme's color for the level
     - Records entry timestamp
   - Returns `ExitHandle` containing timestamp, label, and level

2. `exit(handle)`
   - Checks if current log level allows output at the handle's level
   - Searches for the handle in the enter/exit stack:
     - **Handle not found**: Logs warning and returns early (no-op)
       - This covers: never entered, already exited, or auto-closed during previous unwind
     - **Handle found, but not at top**: Logs warning, then performs **stack unwinding**
       - Closes all pending entries from top down to and including the requested handle
     - **Handle at top of stack**: Normal exit behavior
   - **On stack unwinding**:
     - Closes all pending enter/exit pairs from the top of the stack down to and including the requested handle
     - Outputs exit messages for each unwound entry with their respective elapsed times
     - This prevents orphaned groups and mirrors exception handling behavior
   - **On normal exit**:
     - If allowed by log level:
       - Calculates elapsed time since entry
       - Outputs: `"[exit-prefix] [label] (elapsed: XXms)"` with theme's color for the level
       - Calls `groupEnd()` to close indentation (respects theme's groupMode setting)
     - Removes handle from stack

**Examples:**

```typescript
import { getLogger, themes } from "@autotracer/logger";

const logger = getLogger("app");
logger.setLogLevel("trace"); // Required to see enter/exit output

// Default theme (no prefix/color), showName: true
const h = logger.enter("fetchData");
logger.exit(h);
// Output:
//   [app] fetchData
//   [app] fetchData (elapsed: 15.7ms)

// Emoji theme, showName: true
logger.setTheme(themes.emoji);
const h = logger.enter("fetchData", "debug");
logger.exit(h);
// Output (in green):
//   [app] ▶️ fetchData
//   [app] ◀️ fetchData (elapsed: 15.7ms)

// Minimal theme, showName: false
logger.setShowName(false);
logger.setTheme(themes.minimal);
const h = logger.enter("fetchData");
logger.exit(h);
// Output (text mode):
//   ├─ → fetchData
//   └─ ← fetchData (elapsed: 15.7ms)
```

**Note:**

- When `enter()` is called, the group created internally respects the enter's level parameter, not the standalone `group()` function's `log` level
- The grouping style (console.group vs UTF-8 art) follows the logger's current theme `groupMode` setting
- Enter/exit markers use theme's `prefixes.enter` and `prefixes.exit`, colored with the specified level's color
- If theme has no enter/exit prefix defined, the label is output without a prefix
- Logger name (if `showName: true`) appears before enter/exit markers

**Mismatch Detection Example:**

```typescript
const logger = getLogger("app");
logger.setTheme(themes.emoji);
logger.setLogLevel("trace");

const h1 = logger.enter("outerFunction");
const h2 = logger.enter("innerFunction");
logger.log("Processing data...");
logger.exit(h1); // ⚠️ Mismatch! Expected to exit "innerFunction" but got "outerFunction"

// Console output:
// [app] ▶️ outerFunction
//   [app] ▶️ innerFunction
//     [app] 📝 Processing data...
// ⚠️ Warning: Expected to exit "innerFunction", but got "outerFunction". Unwinding stack...
//   [app] ◀️ innerFunction (elapsed: 8.3ms)  ← Auto-closed during unwind
//   [app] ◀️ outerFunction (elapsed: 12.5ms)  ← Requested exit

// Both functions are now closed (stack unwound)
// This prevents orphaned groups and mirrors exception handling behavior
```

**Stack Unwinding Behavior:**

When `exit()` detects a mismatch, it automatically closes all pending `enter()` calls from the top of the stack down to and including the requested handle. This is similar to how exception handling works - when you exit early, everything unwinds cleanly.

**Stack unwinding is scoped to the logger instance** - each logger maintains its own enter/exit stack.

```typescript
const logger = getLogger("app");

const h1 = logger.enter("A");
const h2 = logger.enter("B");
const h3 = logger.enter("C");
logger.exit(h1); // Unwinds C, B, then exits A

// Output:
// [app] ▶️ A
//   [app] ▶️ B
//     [app] ▶️ C
// ⚠️ Warning: Expected to exit "C", but got "A". Unwinding stack...
//   [app] ◀️ C (elapsed: 2ms)   ← Auto-unwound
//   [app] ◀️ B (elapsed: 5ms)   ← Auto-unwound
//   [app] ◀️ A (elapsed: 10ms)  ← Requested exit
```

**Edge Case: Exit Without Enter (Double Exit)**

```typescript
const h = enter("functionA");
exit(h); // Normal exit

exit(h); // ⚠️ Handle not found (already exited)

// Output:
// ▶️ functionA
//   ◀️ functionA (elapsed: 5ms)
// ⚠️ Warning: Cannot exit "functionA" - handle not found in stack
```

**Edge Case: Exit After Unwind**

```typescript
const h1 = enter("A");
const h2 = enter("B");
exit(h1); // Unwinds B, then exits A
exit(h2); // ⚠️ Handle not found (already closed during unwind)

// Output:
// ▶️ A
//   ▶️ B
// ⚠️ Warning: Expected to exit "B", but got "A". Unwinding stack...
//   ◀️ B (elapsed: 3ms)   ← Auto-unwound
//   ◀️ A (elapsed: 8ms)   ← Requested exit
// ⚠️ Warning: Cannot exit "B" - handle not found in stack
```

**Edge Case: Exit Never Entered**

```typescript
const logger = getLogger("app");

const h = {
  label: "phantom",
  startTime: performance.now(),
  level: "trace" as LogLevel,
};
logger.exit(h); // Never called enter()

// Output:
// ⚠️ Warning: Cannot exit "phantom" - handle not found in stack
```

**Note:** All "handle not found" scenarios produce the same warning. The implementation simply searches the logger's stack - if the handle isn't found (whether never entered, already exited, or auto-closed during unwinding), it warns and returns. No need to distinguish between the different causes.

**Correct Nested Usage:**

```typescript
const logger = getLogger("app");

const h1 = logger.enter("outerFunction");
logger.log("Starting outer work...");

const h2 = logger.enter("innerFunction");
logger.log("Inner work...");
logger.exit(h2); // ✅ Correct - exits innerFunction

logger.log("Continuing outer work...");
logger.exit(h1); // ✅ Correct - exits outerFunction

// Output:
// [app] ▶️ outerFunction
//   [app] 📝 Starting outer work...
//   [app] ▶️ innerFunction
//     [app] 📝 Inner work...
//   [app] ◀️ innerFunction (elapsed: 5.2ms)
//   [app] 📝 Continuing outer work...
// [app] ◀️ outerFunction (elapsed: 12.8ms)
```

## Types

```typescript
type LogLevel =
  | "fatal"
  | "error"
  | "warn"
  | "log"
  | "info"
  | "debug"
  | "verbose"
  | "trace";

/**
 * Handle returned by enter() that must be passed to exit().
 * Treated as an opaque token - do not modify its properties.
 * The object reference is used for stack matching via reference equality.
 */
interface ExitHandle {
  readonly label: string;
  readonly startTime: number;
  readonly level: LogLevel;
}
```

**ExitHandle Design Notes:**

The `ExitHandle` is an immutable object that serves as both:

1. **Data carrier**: Contains label, startTime, and level for `exit()` to use
2. **Stack identifier**: The object reference itself is used for matching (reference equality)

**Why object instead of ID?**

- **No lookup needed**: `exit()` reads data directly from the handle (no Map/WeakMap required)
- **Reference equality**: Stack matching uses `stack.indexOf(handle)` - simple and fast
- **No ID generation**: No need to maintain unique IDs or increment counters
- **Garbage collection**: When exited and user drops reference, it GCs naturally
- **Type safety**: TypeScript ensures users pass the correct type

**User contract:**

- Treat the handle as opaque - don't modify its properties (readonly in TypeScript)
- Pass the exact object returned by `enter()` to `exit()`
- Don't try to construct handles manually (they won't be on the stack)

## Implementation Notes

### Logger Architecture

**Registry Pattern:**

- Internal registry: `Map<string, Logger>` stores all created loggers
- `getLogger(name)` returns existing logger or creates new one
- Each logger is a singleton per name (same name = same instance)

**Logger Instance State:**

Each logger maintains completely independent state:

```typescript
{
  name: string,              // Logger identifier
  level: LogLevel,           // Current log level filter
  theme: Theme,              // Visual styling configuration
  showName: boolean,         // Whether to prepend [name] to output
  groupStack: number,        // Internal: current group nesting depth
  enterStack: ExitHandle[]   // Internal: active enter/exit pairs
}
```

**Independence:**

- No shared state between loggers
- Configuration changes only affect the specific logger
- Group and enter/exit stacks are per-logger (isolated nesting)

### Safe Console Wrappers

- **safeLog**: Wraps `console.log` with try-catch to prevent logging failures from breaking application
- **safeGroup/safeGroupEnd**: Wrappers around `console.group`/`console.groupEnd` with try-catch

### Name Prefix Application

When `showName: true`, the logger name is prepended to all output:

1. **Format**: `[name]` with space separator
2. **Applied to**: All logging functions, group labels, enter/exit markers
3. **Order**: Name prefix comes first, then theme prefix (if any)
4. **Styling**: Name prefix is included in theme color styling (if defined)

**Implementation pattern:**

```typescript
// Pseudo-code for logging with name prefix
function logWithName(message, ...args) {
  if (showName) {
    message = `[${name}] ${message}`;
  }
  // ... then apply theme styling to entire message including name
}
```

### Theme Application

Each logging function applies the logger's current theme color and prefix:

1. **Prepend name**: If `showName: true`, prepend `[name]` to message
2. **Get theme**: Retrieve logger's current theme
3. **Build prefix**: If theme has a prefix for this level, prepend it to the message
4. **Apply color**: If theme has a color for this level, use console styling:
   - Browser: `console.log('%c [name] prefix message', 'color: #ff0000', ...args)`
   - The `%c` directive applies the CSS style to subsequent text
5. **Fallback**: If no color/prefix, pass through to `safeLog()` unchanged

**Color Format:**

- Theme colors must be valid CSS color values (hex, rgb, named colors)
- Applied using `console.log('%c ...', 'color: VALUE')` syntax
- Colors affect the entire styled portion (name + theme prefix + message)

**Prefix Format:**

- Logger name (if `showName: true`): `[name]`
- Theme prefix (if defined): Appended after name
- Order: `[name] [theme-prefix] message`

**Implementation Pattern (conceptual):**

```typescript
// Conceptual implementation for logger.error()
function error(message?: unknown, ...optionalParams: unknown[]): void {
  if (shouldLog("error")) {
    let finalMessage = message;

    // 1. Prepend logger name
    if (this.showName) {
      finalMessage = `[${this.name}] ${finalMessage}`;
    }

    // 2. Apply theme
    const theme = this.theme;
    const prefix = theme.prefixes.error || "";
    const color = theme.colors.error;

    if (color && prefix) {
      // Styled with both color and prefix
      safeLog(
        `%c${prefix} ${finalMessage}`,
        `color: ${color}`,
        ...optionalParams
      );
    } else if (color) {
      // Styled with color only
      safeLog(`%c${finalMessage}`, `color: ${color}`, ...optionalParams);
    } else if (prefix) {
      // Prefix only, no color
      safeLog(`${prefix} ${finalMessage}`, ...optionalParams);
    } else {
      // No styling
      safeLog(finalMessage, ...optionalParams);
    }
  }
}
```

**Handling User-Provided `%c` Directives:**

If the user passes their own `%c` directives in the message, they are preserved and work alongside theme styling:

```typescript
const logger = getLogger("api");
logger.setTheme(themes.emoji);

// User provides %c directive
logger.error("%cCustom message", "color: blue", "extra data");

// With emoji theme (has color #ff4444 and prefix 💥), showName: true
// Becomes: console.log('%c[api] 💥 %cCustom message', 'color: #ff4444', 'color: blue', 'extra data')
// Result: "[api] 💥" in red (#ff4444), "Custom message" in blue, "extra data" unstyled
```

The console processes multiple `%c` directives sequentially, each consuming the next style argument. The theme's `%c` applies to the prefix, while user-provided `%c` directives control their own text segments.

**Edge Cases:**

- If `message` is not a string (e.g., object, number), it's coerced to string via template literal
  **Edge Cases:**

- If `message` is not a string (e.g., object, number), it's coerced to string via template literal
- Non-string messages with user `%c` directives: logger name/theme still applied
- If user provides `%c` but not enough style args, console ignores incomplete directives
- Objects, errors, and other complex types in `optionalParams` are never modified
- Theme styling only applies when both message and theme properties are defined

### State Management

**Per-Logger State:**

Each logger instance maintains its own independent state:

- **level**: Current log level filter (no shared global state)
- **theme**: Visual styling configuration (independent per logger)
- **showName**: Name visibility setting (independent per logger)
- **Group nesting**: Internal stack tracking group depth (per-logger)
- **Enter/Exit tracking**: Internal stack of active enter/exit pairs (per-logger)

**Stack Management:**

- **Group stack**: Tracks nesting depth for proper `groupEnd()` matching
- **Enter/exit stack**: Tracks active enter/exit pairs
  - Stack holds `ExitHandle` objects (reference equality for matching)
  - `enter()` pushes handle onto logger's stack and returns it to user
  - `exit()` searches logger's stack via `indexOf(handle)` - reference equality check
  - No Map/WeakMap needed - handle object contains all required data
  - Unmatched `exit()` calls trigger `console.warn` (always, regardless of log level)
  - **Stack unwinding**: On mismatch, automatically close all pending entries from top of logger's stack down to the requested handle
  - This prevents orphaned groups and ensures clean indentation

**Independence:**

- No shared state between loggers
- Configuration changes only affect the specific logger
- Stacks are scoped per logger (group/enter in one logger doesn't affect others)
  - Vanilla `group()`/`groupEnd()` have no mismatch detection (standard console.group behavior)
  - Only `enter()`/`exit()` pairs are validated for matching

**Enter/Exit Stack Implementation (Per-Logger):**

```typescript
// Conceptual - each logger instance has its own stack
class Logger {
  private enterStack: ExitHandle[] = [];

  enter(label: string, level: LogLevel = "trace"): ExitHandle {
    const handle: ExitHandle = { label, startTime: performance.now(), level };
    this.enterStack.push(handle);
    // ... output and grouping logic
    return handle;
  }

  exit(handle: ExitHandle): void {
    const index = this.enterStack.indexOf(handle); // Reference equality
    if (index === -1) {
      console.warn(`Cannot exit "${handle.label}" - handle not found in stack`);
      return;
    }

    if (index < this.enterStack.length - 1) {
      // Mismatch: handle is deeper in stack, unwind
      const expected = this.enterStack[this.enterStack.length - 1];
      console.warn(
        `Expected to exit "${expected.label}", but got "${handle.label}". Unwinding stack...`
      );
      // Close from top down to index
      for (let i = this.enterStack.length - 1; i >= index; i--) {
        // ... output exit for this.enterStack[i]
      }
      this.enterStack.length = index; // Truncate stack
    } else {
      // Match: handle is at top
      this.enterStack.pop();
      // ... normal exit output
    }
  }
}
```

## Design Principles

- **Named instances**: Each logger is an independent entity with its own configuration and state
- **Single responsibility**: Each function does one thing
- **No shared state**: Configuration changes only affect the specific logger
- **Minimal parameters**: ≤3 per function
- **Testability**: Logger instances can be created and tested in isolation
- **Type safety**: Strict TypeScript with no casts

## Visual Output Examples

### Default Theme (Plain Console)

```typescript
import { getLogger, themes } from "@autotracer/logger";

const logger = getLogger("app");
logger.setTheme(themes.default);
logger.setLogLevel("trace");

logger.error("Connection failed");
logger.warn("Cache miss");
logger.info("User logged in");
logger.debug("State updated");

const h = logger.enter("processData");
logger.log("Processing...");
logger.exit(h);
```

````

**Output:**

```
[app] Connection failed
[app] Cache miss
[app] User logged in
[app] State updated
▼ [app] processData
  [app] Processing...
  [app] processData (elapsed: 5.2ms)
```

### Emoji Theme (Colorful with Icons)

```typescript
import { getLogger, themes } from '@autotracer/logger';

const logger = getLogger('database');
logger.setTheme(themes.emoji);
logger.setLogLevel("trace");

logger.error("Connection failed");
logger.warn("Cache miss");
logger.info("User logged in");
logger.debug("State updated");

const h = logger.enter("processData", "debug");
logger.log("Processing...");
logger.exit(h);
```

**Output:** (with colors)

```
[database] 💥 Connection failed          (in red #ff4444)
[database] ⚠️ Cache miss                 (in orange #ffaa00)
[database] ℹ️ User logged in             (in blue #00aaff)
[database] 🐛 State updated              (in green #00ff00)
▼ [database] ▶️ processData              (in green #00ff00)
  [database] 📝 Processing...            (in gray #888888)
  [database] ◀️ processData (elapsed: 5.2ms)  (in green #00ff00)
```

### Minimal Theme (Text Mode)

```typescript
import { getLogger, themes } from '@autotracer/logger';

const logger = getLogger('api');
logger.setTheme(themes.minimal);
logger.setLogLevel("trace");

logger.error("Connection failed");
logger.warn("Cache miss");
logger.info("User logged in");
logger.debug("State updated");

const h = logger.enter("processData");
logger.log("Processing...");
logger.exit(h);
```

**Output:**

```
[api] [ERROR] Connection failed
[api] [WARN] Cache miss
[api] [INFO] User logged in
[api] [DEBUG] State updated
├─ [api] → processData
│  [api] [LOG] Processing...
└─ [api] ← processData (elapsed: 5.2ms)
```

### Monochrome Theme (ASCII Art)

```typescript
import { getLogger, themes } from '@autotracer/logger';

const logger = getLogger('system');
logger.setTheme(themes.monochrome);
logger.setLogLevel("trace");

logger.error("Connection failed");
logger.warn("Cache miss");
logger.info("User logged in");
logger.debug("State updated");

const h = logger.enter("processData");
logger.log("Processing...");
logger.exit(h);
```

**Output:**

```
[system] [X] Connection failed
[system] [*] Cache miss
[system] [i] User logged in
[system] [d] State updated
├─ [system] > processData
│  [system] [ ] Processing...
└─ [system] < processData (elapsed: 5.2ms)
```

### Multiple Loggers with Different Themes

```typescript
import { getLogger, themes } from '@autotracer/logger';

const appLogger = getLogger('app');
const dbLogger = getLogger('database');

appLogger.setTheme(themes.emoji);
appLogger.setLogLevel('info');

dbLogger.setTheme(themes.minimal);
dbLogger.setLogLevel('debug');

appLogger.info('Application started'); // → [app] ℹ️ Application started (blue)
dbLogger.debug('Connected to database'); // → [database] [DEBUG] Connected to database
appLogger.error('Failed to load config'); // → [app] 💥 Failed to load config (red)
dbLogger.info('Query executed'); // → [database] [INFO] Query executed
```

## Usage Examples

### Basic Logger Creation and Configuration

```typescript
import { getLogger, themes } from '@autotracer/logger';

// Create/get logger instances
const appLogger = getLogger('app');
const dbLogger = getLogger('database');

// Configure independently
appLogger.setLogLevel('info');
appLogger.setTheme(themes.emoji);

dbLogger.setLogLevel('debug');
dbLogger.setTheme(themes.minimal);

// Use loggers
appLogger.log('Application started'); // → [app] 📝 Application started (gray)
dbLogger.debug('Query executed', { rows: 42 }); // → [database] [DEBUG] Query executed {rows: 42}
```
debug("State updated");

const h = enter("processData");
log("Processing...");
exit(h);
```

**Output:**

```
[X] Connection failed
[*] Cache miss
[i] User logged in
[d] State updated
├─ > processData
│  [ ] Processing...
└─ < processData (elapsed: 5.2ms)
```

## Usage Examples

## Usage Examples

### Basic Logger Creation and Configuration

```typescript
import { getLogger, themes } from '@autotracer/logger';

// Create/get logger instances
const appLogger = getLogger('app');
const dbLogger = getLogger('database');

// Configure independently
appLogger.setLogLevel('info');
appLogger.setTheme(themes.emoji);

dbLogger.setLogLevel('debug');
dbLogger.setTheme(themes.minimal);

// Use loggers
appLogger.log('Application started'); // → [app] 📝 Application started (gray)
dbLogger.debug('Query executed', { rows: 42 }); // → [database] [DEBUG] Query executed {rows: 42}
```

### Customizing Themes

```typescript
import { getLogger, themes } from '@autotracer/logger';

const logger = getLogger('app');

// Use preset theme
logger.setTheme(themes.emoji);

// Customize preset with spread
logger.setTheme({ ...themes.emoji, groupMode: "text" });

// Custom theme from scratch
logger.setTheme({
  groupMode: "default",
  colors: {
    error: "#ff0000",
    warn: "#ffaa00",
    info: "#00aaff",
    trace: "#888888",
  },
  prefixes: {
    error: "💥",
    warn: "⚠️",
    info: "ℹ️",
    enter: "▶",
    exit: "◀",
  },
});

// Mix and match presets
logger.setTheme({
  ...themes.emoji,
  colors: themes.monochrome.colors,
  groupMode: "text",
});
```

### Controlling Name Visibility

```typescript
import { getLogger } from '@autotracer/logger';

const logger = getLogger('database');

// Default: name shown
logger.log('Connected'); // → [database] Connected

// Hide name for cleaner output
logger.setShowName(false);
logger.log('Connected'); // → Connected

// Re-enable
logger.setShowName(true);
logger.log('Connected'); // → [database] Connected
```

### Basic Logging

```typescript
import { getLogger } from '@autotracer/logger';

const logger = getLogger('app');
logger.setLogLevel("debug");

logger.log("Application started");
logger.debug("Configuration loaded:", config);
```

### Hierarchical Groups

```typescript
import { getLogger } from '@autotracer/logger';

const logger = getLogger('auth');

logger.group("User Authentication");
logger.log("Checking credentials...");
logger.group("Database Query");
logger.log("Connecting to DB...");
logger.log("Query executed");
logger.groupEnd();
logger.log("Authentication successful");
logger.groupEnd();
```
```

### Performance Tracking

```typescript
import { enter, exit, setLogLevel } from "@autotracer/logger";

setLogLevel("trace"); // Required to see enter/exit output

function processData(data) {
  const h = enter("processData");

  // ... processing logic ...

  exit(h);
}

// For critical paths, use higher level
function criticalOperation() {
  const h = enter("criticalOperation", "info"); // Visible even at 'info' level
  // ... work ...
  exit(h);
}
```

### Performance Tracking

```typescript
import { getLogger } from '@autotracer/logger';

const logger = getLogger('app');
logger.setLogLevel("trace"); // Required to see enter/exit output

function processData(data) {
  const h = logger.enter("processData");

  // ... processing logic ...

  logger.exit(h);
}

// For critical paths, use higher level
function criticalOperation() {
  const h = logger.enter("criticalOperation", "info"); // Visible even at 'info' level
  // ... work ...
  logger.exit(h);
}
```

**Output (default theme, console.group mode):**

```
[app] ▶ processData
  [app] ◀ processData (elapsed: 15.7ms)
```

**Output (text mode with UTF-8 art):**

```
├─ [app] → processData
│  [any nested logs indented]
└─ [app] ← processData (elapsed: 15.7ms)
```

### Nested Enter/Exit

```typescript
import { getLogger } from '@autotracer/logger';

const logger = getLogger('app');

const h1 = logger.enter("outerFunction");
logger.log("Starting outer work...");

const h2 = logger.enter("innerFunction");
logger.log("Inner work...");
logger.exit(h2);

logger.log("Continuing outer work...");
logger.exit(h1);
```

**Output (default theme, console.group mode):**

```
[app] ▶ outerFunction
  [app] Starting outer work...
  [app] ▶ innerFunction
    [app] Inner work...
    [app] ◀ innerFunction (elapsed: 5.2ms)
  [app] Continuing outer work...
  [app] ◀ outerFunction (elapsed: 12.8ms)
```

**Output (text mode with UTF-8 art):**

```
├─ [app] → outerFunction
│  │  [app] Starting outer work...
│  ├─ [app] → innerFunction
│  │  │  [app] Inner work...
│  └─ [app] ← innerFunction (elapsed: 5.2ms)
│  │  [app] Continuing outer work...
└─ [app] ← outerFunction (elapsed: 12.8ms)
```

### Multiple Independent Loggers

```typescript
import { getLogger, themes } from '@autotracer/logger';

// Application logger - emoji theme, info level
const appLogger = getLogger('app');
appLogger.setTheme(themes.emoji);
appLogger.setLogLevel('info');

// Database logger - minimal theme, debug level
const dbLogger = getLogger('database');
dbLogger.setTheme(themes.minimal);
dbLogger.setLogLevel('debug');

// API logger - monochrome theme, trace level
const apiLogger = getLogger('api');
apiLogger.setTheme(themes.monochrome);
apiLogger.setLogLevel('trace');

// Use loggers independently
appLogger.info('Application starting'); // → [app] ℹ️ Application starting (blue)

const dbHandle = dbLogger.enter('query', 'debug');
dbLogger.debug('Executing SQL'); // → [database] [DEBUG] Executing SQL
dbLogger.exit(dbHandle); // → [database] ← query (elapsed: 3ms)

const apiHandle = apiLogger.enter('fetch', 'trace');
apiLogger.trace('HTTP request started'); // → [api] [t] HTTP request started
apiLogger.exit(apiHandle); // → [api] < fetch (elapsed: 12ms)

appLogger.info('Application ready'); // → [app] ℹ️ Application ready (blue)
```

## Migration Guide (Breaking Changes from v1.x)

### Old API (v1.x - Global Functions)

```typescript
import { log, setLogLevel, setTheme, enter, exit, themes } from '@autotracer/logger';

setLogLevel('debug');
setTheme(themes.emoji);

log('Application started');

const h = enter('processData');
// ... work ...
exit(h);
```

### New API (v2.x - Named Loggers)

```typescript
import { getLogger, themes } from '@autotracer/logger';

const logger = getLogger('app'); // Create/get logger instance

logger.setLogLevel('debug');
logger.setTheme(themes.emoji);

logger.log('Application started');

const h = logger.enter('processData');
// ... work ...
logger.exit(h);
```

### Key Differences

1. **No global functions** - All functions are now methods on logger instances
2. **Explicit logger creation** - Use `getLogger(name)` to get/create loggers
3. **Independent configuration** - Each logger has its own level, theme, and state
4. **Name visibility** - Logger names appear in output by default (`[name] message`)
5. **`themes` export** - Import `themes` separately, no longer on namespace object

### Migration Steps

1. Replace all imports:
   ```typescript
   // Old
   import { log, error, setLogLevel } from '@autotracer/logger';

   // New
   import { getLogger } from '@autotracer/logger';
   const logger = getLogger('your-app-name');
   ```

2. Update configuration calls:
   ```typescript
   // Old
   setLogLevel('debug');
   setTheme(themes.emoji);

   // New
   logger.setLogLevel('debug');
   logger.setTheme(themes.emoji);
   ```

3. Update all logging calls:
   ```typescript
   // Old
   log('Message');
   error('Error');

   // New
   logger.log('Message');
   logger.error('Error');
   ```

4. Update enter/exit calls:
   ```typescript
   // Old
   const h = enter('fn');
   exit(h);

   // New
   const h = logger.enter('fn');
   logger.exit(h);
   ```

5. Handle name prefixes:
   ```typescript
   // If you don't want logger names in output
   logger.setShowName(false);
   ```

## Summary

The logger package provides **named logger instances** with complete independence:

- **Factory pattern**: `getLogger(name)` creates/retrieves loggers
- **Per-logger configuration**: Each logger has its own level, theme, and name visibility
- **Per-logger state**: Independent group and enter/exit stacks
- **8 log levels**: fatal, error, warn, log, info, debug, verbose, trace
- **4 preset themes**: default, minimal, emoji, monochrome
- **Hierarchical grouping**: Nested groups with console.group or UTF-8 art
- **Performance tracking**: enter/exit with timing and stack unwinding
- **Name visibility**: Configurable `[name]` prefix on all output (default: shown)
- **Type safety**: Strict TypeScript with no casts

**Key design principles:**

- No shared state between loggers
- Configuration changes only affect specific logger
- Lazy creation via registry pattern
- All loggers start with identical defaults
- Complete API on each logger instance

## Open Questions

1. ~~Should we add more log levels (e.g., `fatal`, `verbose`)?~~ ✅ Added
2. ~~Should `enter`/`exit` support custom log levels?~~ ✅ Added
3. ~~Should we support structured logging (JSON output)?~~ ❌ No - this is an enhanced console.log, not a structured logger
4. ~~Should groups auto-close on error to prevent broken indentation?~~ No - vanilla `group()` behaves like console.group (no auto-close)
5. ~~Should we track and warn about unmatched enter/exit calls?~~ ✅ Yes - `console.warn` on mismatched `exit()`, but vanilla `group()`/`groupEnd()` are untracked
6. ~~Should theme colors support ANSI codes for terminal output, or only HTML colors for browser console?~~ ❌ No - HTML colors only for browser console
7. ~~Should there be a way to reset theme to default without reloading?~~ ✅ Yes - `logger.setTheme(themes.default)` resets to default theme
8. ~~Should unmatched `exit()` warnings include stack trace to help find the source?~~ ✅ Yes - `console.warn` includes stack trace automatically
````
