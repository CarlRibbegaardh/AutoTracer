# Dark+ Theme - Semantic Mapping for AutoTracer

## Theme Overview

Dark+ is Microsoft's default dark theme for Visual Studio Code. It provides a professional, balanced color scheme with moderate contrast that's comfortable for extended coding sessions.

### Core Palette

| Color | Hex | Semantic Meaning |
|-------|-----|------------------|
| Yellow | `#dcdcaa` | Functions, methods |
| Blue-Green | `#4ec9b0` | Types, classes, interfaces |
| Light Blue | `#9cdcfe` | Variables, properties, parameters |
| Blue | `#569cd6` | Keywords, control flow, storage, language constants |
| Orange | `#ce9178` | Strings |
| Light Green | `#b5cea8` | Numbers, constants |
| Red | `#f44747` | Errors, invalid states |
| White | `#d4d4d4` | Default foreground, operators |
| Green | `#6a9955` | Comments |

## Core Semantic Token Mappings

### From Theme Analysis

**Functions & Methods:**
```yaml
scope: entity.name.function, support.function
foreground: #DCDCAA  # Yellow
```

**Parameters:**
```yaml
scope: variable.parameter
foreground: #9CDCFE  # Light Blue
```

**Variables & Properties:**
```yaml
scope: variable, variable.other.readwrite, support.variable.property
foreground: #9CDCFE  # Light Blue
```

**Constants:**
```yaml
scope: constant.language
foreground: #569cd6  # Blue
# constant.numeric uses #b5cea8 (light green)
```

**Keywords & Control Flow:**
```yaml
scope: keyword, storage, storage.type, storage.modifier
foreground: #569cd6  # Blue
```

**Types & Classes:**
```yaml
scope: entity.name.type, entity.name.class, support.class, support.type
foreground: #4ec9b0  # Blue-Green
```

**Strings:**
```yaml
scope: string
foreground: #ce9178  # Orange
```

**Comments:**
```yaml
scope: comment
foreground: #6A9955  # Green
```

**Errors:**
```yaml
scope: invalid
foreground: #f44747  # Red
fontStyle: (varies by context)
```

**Warnings:**
```yaml
scope: log.warning
foreground: #ccd870  # Yellow-green (estimated, not in base theme)
```

## AutoTracer React18 Semantic Mapping

| Category | Dark+ Mapping | Rationale |
|----------|---------------|-----------|
| **Lifecycle: definitiveRender** | **Blue** `#569cd6` | **Render is a keyword/control flow event** - matches `keyword` scope (blue) |
| **Props: propInitial, propChange** | **Blue-Green** `#4ec9b0` | **Props are component types/interfaces** - matches `entity.name.type` semantic (blue-green) |
| **State: stateInitial, stateChange** | **Light Blue** `#9cdcfe` | **State is component variable data** - matches `variable` scope (light blue) |
| **Logs: logStatements** | **Yellow** `#dcdcaa` | **Log is a function call** - matches `entity.name.function` scope |
| **Warnings: warnStatements, identicalStateValueWarning, identicalPropValueWarning** | **Orange** `#ce9178` | **Warnings need visibility** - uses string color (orange) with bold for attention |
| **Errors: errorStatements** | **Red** `#f44747` | **Errors are invalid states** - matches `invalid` semantic (red + bold) |
| **Metadata: reconciled, skipped** | **Green** `#6a9955` | **Reconciled/skipped are background metadata** - matches `comment` scope (green) |

## AutoTracer Flow Semantic Mapping

| Category | Dark+ Mapping | Rationale |
|----------|---------------|-----------|
| **Async: asyncStart, asyncComplete** | **Yellow** `#dcdcaa` **+ italic** | **Async operations are function calls** - matches `entity.name.function` scope (yellow) with italic to distinguish from synchronous functions |
| **Functions: functionEnter, functionExit** | **Yellow** `#dcdcaa` | **Primary execution functions** - matches `entity.name.function` scope (yellow) |
| **Parameters: parameter** | **Light Blue** `#9cdcfe` | **Parameters are function inputs** - matches `variable.parameter` scope (light blue + italic) |
| **Returns: returnValue** | **Blue-Green** `#4ec9b0` | **Return values define function output type** - matches `entity.name.type` scope (blue-green), creating visual data flow: light blue inputs → yellow execution → blue-green outputs |
| **Exceptions: exception** | **Red** `#f44747` | **Exceptions are errors** - matches `invalid` semantic (red + bold) |
| **Runtime Control: runtimeControl** | **Green** `#6a9955` | **Runtime metadata** - matches `comment` scope (green) |

## Design Rationale

### Why These Mappings?

1. **Function Recognition**: Yellow (`#dcdcaa`) is Dark+'s function color - users see yellow when they write `function foo()` in their editor. AutoTracer functions and async operations should feel the same.

2. **Parameter Consistency**: Light blue (`#9cdcfe`) with italic is Dark+'s parameter style - users see light blue italic when they write `function(param1, param2)`. AutoTracer should maintain this mental model.

3. **State as Variables**: Light blue (`#9cdcfe`) is Dark+'s variable color - React state is component variable data. This aligns with variable declarations in code.

4. **Props as Types**: Blue-green (`#4ec9b0`) is Dark+'s type/class color - props define the "interface" or "type" of a component. This semantic fits perfectly.

5. **Keywords for Renders**: Blue (`#569cd6`) is Dark+'s keyword color - rendering is a lifecycle "event" or "keyword moment" in React's execution model.

6. **Warnings Stand Out**: Orange (`#ce9178`) with bold makes warnings visible - reusing the string color ensures they're noticeable without being alarming.

7. **Metadata Recedes**: Comment green (`#6a9955`) for reconciled/skipped traces - these are "under the hood" details, like comments in code.

## Color Psychology

Dark+'s professional palette:
- **Yellow/Blue-Green**: Active code (functions, types)
- **Blue**: Control flow (keywords, renders, constants)
- **Light Blue**: Data (variables, parameters, state)
- **Orange**: Strings and warnings
- **Red**: Critical errors
- **Green**: Background information (comments, metadata)

This creates a natural visual hierarchy: execution is warm (yellow), structure is cool (blue-green), data is light (light blue), flow control is blue, issues are red/orange, metadata is muted (green).

## Accessibility Notes

- Moderate contrast ratios - comfortable for long sessions
- Distinct hues work well for colorblind users
- Bold weights for warnings/errors add redundant encoding
- Green is sufficiently distinct from other colors while remaining subdued

## Implementation Strategy

**Bold Usage:**
- Warnings: bold weight (visual emphasis)
- Errors: bold weight (critical emphasis)
- Renders: bold weight (lifecycle emphasis)
- All other categories: normal weight

**Italic Usage:**
- Parameters: italic (matches editor convention)
- Async operations: italic (distinguishes from synchronous functions)
- Initial values (propInitial, stateInitial): italic (indicates "first value")

**Color Grouping:**
- Execution flow: Yellow (`#dcdcaa`) - functions, async, logs
- Component structure: Blue-Green (`#4ec9b0`) - props, return values
- Component data: Light Blue (`#9cdcfe`) - state, parameters
- Lifecycle events: Blue (`#569cd6`) - renders
- Data flow: Light Blue → Yellow → Blue-Green (`#9cdcfe` → `#dcdcaa` → `#4ec9b0`) - parameters → execution → returns
- Issues: Red/Orange (`#f44747`, `#ce9178`) - errors, warnings
- Metadata: Green (`#6a9955`) - reconciled, skipped, runtime control

---

**Key Principle**: Users should recognize AutoTracer output based on the same semantic meaning they see in their editor code. If they see yellow functions in VS Code, they should see yellow function traces in AutoTracer output.

## Theme Consistency

Dark+ uses a **professional, balanced approach**:
- Functions are prominent (yellow)
- Types define structure (blue-green)
- Variables hold data (light blue)
- Keywords control flow (blue)
- Errors demand attention (red)
- Metadata stays subtle (green)

AutoTracer's mapping respects this hierarchy, ensuring developers instantly recognize the semantic meaning of traced output.
