# Auto-Tracer Flow - High-Level Specification

## Overview

Auto-Tracer Flow provides automatic function flow tracing with semantic themed output and runtime control. The system instruments functions at build time and provides a clean API for tracking execution flow with minimal performance overhead when dormant.

## Core Concepts

### Semantic Categories

All flow trace output is categorized into 8 semantic types, each with independent theming:

1. **Function Entry** (`→`) - Marks synchronous function entry
2. **Function Exit** (`←`) - Marks synchronous function exit with duration
3. **Async Start** (`🚀`) - Marks async function entry
4. **Async Complete** (`✅`) - Marks async function completion
5. **Parameter** - Logs function parameters
6. **Return Value** - Logs function return values
7. **Exception** (`💥`) - Logs caught exceptions
8. **Runtime Control** (`🔧`) - Runtime control messages (start/stop tracing)

### Pre-Computed Formatters

For optimal hot path performance, all theme formatters are pre-computed once at tracer creation time. This eliminates repeated theme resolution, mode selection, and icon lookups during function execution.

**Benefits:**
- Theme calculations happen once, not per function call
- Hot path (enter/exit) is optimized for minimal overhead
- Color scheme detection runs once at creation
- Icon and styling resolved upfront

**Trade-off:**
- Theme changes require creating a new tracer instance
- Memory footprint slightly higher (8 pre-computed objects)

### Grouping Modes

Flow tracing supports two grouping visualization modes:

- **`default`** - Uses native `console.group()` for interactive collapsible groups
- **`text`** - Uses UTF-8 box-drawing characters for copy-paste friendly output

The grouping mode is controlled via the canonical `outputMode` runtime API:

- `globalThis.autoTracer.setOutputMode("devtools")` maps to `default` grouping
- `globalThis.autoTracer.setOutputMode("copy-paste")` maps to `text` grouping

Themes remain styling-only (colors/icons/prefixes); grouping is not part of theme configuration.

## API Surface

### FlowTracer Interface

```typescript
interface FlowTracer {
  // Synchronous flow tracking
  enter(functionName: string): ExitHandle;
  exit(handle: ExitHandle): void;

  // Async flow tracking
  enterAsync(functionName: string): ExitHandle;
  exitAsync(handle: ExitHandle): void;

  // Semantic logging
  traceParameter(name: string, value: unknown): void;
  traceReturnValue(value: unknown): void;
  traceException(functionName: string, error: unknown): void;

  // Passthrough logging
  trace(message?: unknown, ...optionalParams: unknown[]): void;
  debug(message?: unknown, ...optionalParams: unknown[]): void;
}
```

### Factory Function

```typescript
function createFlowTracer(
  logger: Logger,
  config?: FlowTracerConfig
): FlowTracer
```

**Configuration:**

```typescript
interface FlowTracerConfig {
  logLevel?: LogLevel;
  logEnter?: boolean;
  logExit?: boolean;
  logTiming?: boolean;
  logParams?: boolean;
  logReturnValues?: boolean;
  warnOnMismatchedExit?: boolean;
  autoRecoverFromMismatch?: boolean;
  include?: FilterConfig;
  exclude?: FilterConfig;
  theme?: FlowThemeConfig;
}
```

### Theme Configuration

```typescript
interface FlowThemeConfig {
  functionEnter?: ColorOptions;
  functionExit?: ColorOptions;
  asyncStart?: ColorOptions;
  asyncComplete?: ColorOptions;
  parameter?: ColorOptions;
  returnValue?: ColorOptions;
  exception?: ColorOptions;
  runtimeControl?: ColorOptions;
}

interface ColorOptions {
  lightMode?: { text?: string; background?: string; bold?: boolean; italic?: boolean };
  darkMode?: { text?: string; background?: string; bold?: boolean; italic?: boolean };
  icon?: string;
}
```

## Build-Time Integration

### Theme File Configuration

Flow tracing supports external theme configuration files for easy customization without code changes.

**Theme Loading Hierarchy:**

The build plugin searches the project root directory and applies theme files in this order:

1. **Base theme file** - First file matching `*flow-theme.json` (e.g., `flow-theme.json`, `my-colorblind-flow-theme.json`)
   - Reads both `light` and `dark` mode configurations
   - Overrides built-in defaults and programmatic config

2. **Light mode override** - First file matching `*flow-theme-light.json` (e.g., `flow-theme-light.json`, `high-contrast-flow-theme-light.json`)
   - Reads only `light` mode configuration
   - Overrides previous light mode settings from step 1

3. **Dark mode override** - First file matching `*flow-theme-dark.json` (e.g., `flow-theme-dark.json`, `custom-flow-theme-dark.json`)
   - Reads only `dark` mode configuration
   - Overrides previous dark mode settings from steps 1-2

**Benefits:**
- **Named themes** - Download and use themes like `deuteranopia-flow-theme.json` without renaming
- **Mode-specific tweaks** - Use a base theme and override just light or dark mode
- **Easy distribution** - Share themes with descriptive names

**Priority order (overall):**
1. External theme files (highest priority) - applied in 3-step hierarchy above
2. Programmatic config passed to `createFlowTracer()`
3. Built-in defaults

The build plugin can inject theme data at build time, eliminating runtime file loading overhead. Theme files use the same `FlowThemeConfig` structure as programmatic configuration:

```json
{
  "functionEnter": {
    "lightMode": { "text": "#0066cc", "bold": true },
    "darkMode": { "text": "#4d94ff", "bold": true },
    "icon": "→"
  },
  "asyncStart": {
    "lightMode": { "text": "#00aa00", "bold": true },
    "darkMode": { "text": "#00ff00", "bold": true },
    "icon": "🚀"
  },
  "exception": {
    "lightMode": { "text": "#ff0000", "background": "#fff0f0", "bold": true },
    "darkMode": { "text": "#ff6b6b", "background": "#3f1f1f", "bold": true },
    "icon": "💥"
  }
}
```

**Rationale:**

Theme files enable **per-developer customization** without modifying project code:

- **Project maintainer** sets sensible defaults via programmatic config
- **Individual developers** drop in their own `flow-theme-light.json` and `flow-theme-dark.json` (gitignored) to override colors/icons
- **Personal preference** without code changes or merge conflicts
- **Easy sharing** - "here's my theme" is just a JSON file attachment

The highest priority for external theme files allows developers to customize console output appearance to their personal preferences (e.g., colorblind-friendly palettes, preferred icons, high-contrast modes) without affecting the team's codebase.

### Babel Plugin

The Babel plugin transforms function declarations and expressions to inject flow tracing calls.

#### `prefix` option

The plugin accepts an optional `prefix` string. When set, it is prepended to the function name passed to `enter()` / `enterAsync()` at build time:

```typescript
// config: prefix: "Island1"
function processData() { ... }
// → __flowTracer.enter("Island1:processData")
```

**Filtering behaviour with `prefix`:** Include/exclude patterns match against the **original, un-prefixed** function name. The prefix is applied *after* the filtering decision — you never need to update filter patterns to account for the prefix.

**Runtime control and `prefix`:** `flowTracer.start()` / `flowTracer.stop()` are global on/off switches. The prefix is purely a build-time label; it has no runtime routing or gating effect.

**Input:**
```typescript
function myFunction(a, b) {
  return a + b;
}
```

**Output:**
```typescript
function myFunction(a, b) {
  const __flowTracer = globalThis.__flowTracer;
  const __h0 = __flowTracer.enter("myFunction");
  try {
    __flowTracer.traceParameter("a", a);
    __flowTracer.traceParameter("b", b);
    const __returnValue = a + b;
    __flowTracer.traceReturnValue(__returnValue);
    return __returnValue;
  } catch (e) {
    __flowTracer.traceException("myFunction", e);
    throw e;
  } finally {
    __flowTracer.exit(__h0);
  }
}
```

### Async Functions

Async functions use dedicated `enterAsync` and `exitAsync` methods:

**Input:**
```typescript
async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}
```

**Output:**
```typescript
async function fetchData(url) {
  const __flowTracer = globalThis.__flowTracer;
  const __h0 = __flowTracer.enterAsync("fetchData");
  try {
    __flowTracer.traceParameter("url", url);
    const response = await fetch(url);
    const __returnValue = response.json();
    __flowTracer.traceReturnValue(__returnValue);
    return __returnValue;
  } catch (e) {
    __flowTracer.traceException("fetchData", e);
    throw e;
  } finally {
    __flowTracer.exitAsync(__h0);
  }
}
```

## Runtime Behavior

### Dormant Mode

When the logger is set to log level "off":

- `enter()`/`exit()` - Fast no-op, ~0.1μs overhead
- `traceParameter()` - No-op
- `traceReturnValue()` - No-op
- `traceException()` - No-op
- No string formatting
- No console I/O
- No theme application

### Active Mode

When logger is at "trace" level:

- `enter()` - Applies theme, calls `logger.enter()`
- `exit()` - Calls `logger.exit()` with handle
- `traceParameter()` - Formats with parameter theme, logs via `logger.trace()`
- `traceReturnValue()` - Formats with return value theme, logs via `logger.trace()`
- `traceException()` - Formats with exception theme, logs via `logger.debug()`

### Grouping Mode Toggle

The canonical `outputMode` controls grouping at runtime:

```js
// Interactive DevTools output
globalThis.autoTracer.setOutputMode("devtools");

// Copy/paste friendly output
globalThis.autoTracer.setOutputMode("copy-paste");
```

Internally, Flow applies `outputMode` by calling `logger.setGroupMode("default" | "text")`.

## Implementation Architecture

### Module Structure

```
packages/auto-tracer-flow/
├── src/
│   └── lib/
│       ├── FlowTracer.ts              # Main tracer implementation
│       ├── types/
│       │   ├── FlowTracerConfig.ts    # Configuration types
│       │   ├── FlowThemeConfig.ts     # Theme configuration
│       │   ├── ColorOptions.ts        # Color styling types
│       │   └── ThemeOptions.ts        # Light/dark theme options
│       ├── constants/
│       │   └── defaultTheme.ts        # Default theme configuration
│       └── functions/
│           └── theme/
│               ├── applyTheme.ts      # Apply theme to text
│               ├── parseThemedMessage.ts # Parse %c formatting
│               ├── selectThemeMode.ts # Choose light/dark theme
│               ├── detectColorScheme.ts # Detect browser scheme
│               └── mergeThemes.ts     # Merge user theme with defaults
```

### Key Design Decisions

1. **Pre-computation over Runtime Calculation**
   - All theme formatters computed once at creation
   - Trades memory for speed on hot path
   - Acceptable for typical application (8 small objects)

2. **Semantic Methods over Generic Logging**
   - Separate methods for each semantic category
   - Clear intent in generated code
   - Easier to theme independently
   - Better tree-shaking for unused categories

3. **Logger Delegation for Grouping**
   - FlowTracer doesn't implement grouping logic
  - Delegates to logger's `setGroupMode(...)`
   - Single source of truth for rendering mode
   - Logger handles console.group vs text mode

4. **Closure-Based State**
   - `currentTheme` tracked in closure
   - No global mutable state
   - Each tracer instance independent
   - Enables multiple tracer instances with different themes

## Performance Characteristics

### Memory

- **Per-tracer overhead**: ~2KB (8 pre-computed theme objects + closures)
- **Per-function overhead**: None (stateless enter/exit)
- **Typical app**: Single global tracer = 2KB total

### CPU

- **Tracer creation**: ~0.1ms (one-time theme pre-computation)
- **Dormant enter/exit**: ~0.1μs (just function call + early return)
- **Active enter/exit**: ~50-100μs (console I/O dominates)
- **Theme application**: 0μs (pre-computed, lookup only)

### I/O

- **Dormant mode**: No console I/O
- **Active mode**: console.group/log/groupEnd per function
- **Grouping overhead**: ~20-50μs per group operation

## Testing Strategy

### Unit Tests

- **Theme functions**: 77 tests covering applyTheme, selectThemeMode, parseThemedMessage, mergeThemes, detectColorScheme
- **Type tests**: 34 tests ensuring type completeness and constraints
- **FlowTracer**: 15 tests covering enter/exit/tracing methods
- **outputMode grouping**: tests covering runtime grouping mode changes via `globalThis.autoTracer.setOutputMode(...)`

**Total**: 129 unit tests

### Integration Tests

- **Babel plugin**: 49 tests verifying code generation with new themed API
- **E2E apps**: Playwright tests in example apps

## Security Considerations

**Never enable in production:**

- Function parameters may contain sensitive data (auth tokens, PII)
- Return values may expose business logic
- Exceptions may leak implementation details
- `globalThis.autoTracer` (runtime control surface) is accessible to anyone with console access
- `globalThis.autoTracer.flowTracer.start()` is accessible to anyone with console access

**Recommended environments:**

- **Local dev**: Active mode for immediate feedback
- **TEST/QA**: Dormant mode, activate via console when debugging
- **Production**: Completely disabled via build config

## Future Enhancements

### Potential Additions

1. **Mismatch Detection** - Warn on mismatched enter/exit calls
2. **Call Stack Validation** - Detect out-of-order exit calls
3. **Performance Metrics** - Aggregate timing data
4. **Theme Presets** - Built-in theme libraries
5. **Filtering Runtime API** - Enable/disable specific functions at runtime

### Constraints

- Theme changes require new tracer instance (by design for performance)
- Grouping mode is binary (default vs text), no custom renderers
- No async flow correlation (promises not tracked across await boundaries)
- Logger dependency required (no standalone operation)

## Version History

### 1.0.0-alpha.30

- ✅ Theme infrastructure with 8 semantic categories
- ✅ Pre-computed formatters for hot path optimization
- ✅ Semantic API methods (enterAsync, exitAsync, traceParameter, traceReturnValue, traceException)
- ✅ Runtime grouping mode toggle via `globalThis.autoTracer.setOutputMode(...)`
- ✅ Babel plugin updated to generate themed API calls
- ✅ 129 unit tests + 49 Babel plugin tests

## License

MIT
