# Dracula Theme - Semantic Mapping for AutoTracer

## Theme Overview

Dracula is a dark theme with vibrant, high-contrast colors. The palette is designed to be easy on the eyes while maintaining excellent readability.

### Core Palette

| Color | Hex | Semantic Meaning |
|-------|-----|------------------|
| Cyan | `#8BE9FD` | Built-in functions, classes, types, symbols |
| Green | `#50FA7B` | Strings, inserted text, success states |
| Orange | `#FFB86C` | Parameters, numbers, modified/changed states |
| Pink | `#FF79C6` | Keywords, operators, storage, control flow |
| Purple | `#BD93F9` | Constants, language built-ins, booleans |
| Red | `#FF5555` | Errors, invalid states, deleted text |
| Yellow | `#F1FA8C` | Strings (secondary), warnings, highlights |
| Comment Gray | `#6272A4` | Comments, metadata, muted information |

## Core Semantic Token Mappings

### From Theme JSON Analysis

**Functions & Methods:**
```yaml
scope: entity.name.function, meta.function-call
foreground: *GREEN  # #50FA7B
```

**Parameters:**
```yaml
scope: variable.parameter, entity.name.variable.parameter
foreground: *ORANGE  # #FFB86C
fontStyle: italic
```

**Variables & Properties:**
```yaml
scope: variable, support.variable.property
foreground: *FG  # #F8F8F2 (default foreground - white)
```

**Constants:**
```yaml
scope: constant, variable.other.constant
foreground: *PURPLE  # #BD93F9
```

**Keywords & Control Flow:**
```yaml
scope: keyword, storage, storage.modifier
foreground: *PINK  # #FF79C6
```

**Types & Classes:**
```yaml
scope: entity.name.type, entity.name.class, support (built-ins)
foreground: *CYAN  # #8BE9FD
fontStyle: italic (for built-ins)
```

**Strings:**
```yaml
scope: string
foreground: *YELLOW  # #F1FA8C
```

**Comments:**
```yaml
scope: comment
foreground: *COMMENT  # #6272A4
```

**Errors:**
```yaml
scope: invalid, log.error
foreground: *RED  # #FF5555
fontStyle: bold
```

**Warnings:**
```yaml
scope: log.warning
foreground: *YELLOW  # #F1FA8C
fontStyle: bold
```

## AutoTracer React18 Semantic Mapping

| Category | Dracula Mapping | Rationale |
|----------|-----------------|-----------|
| **Lifecycle: definitiveRender** | **Pink** `#FF79C6` | **Render is a keyword/control flow event** - matches `keyword` scope (pink) |
| **Props: propInitial, propChange** | **Cyan** `#8BE9FD` | **Props are class properties/types** - matches `entity.name.type`, `support.variable.property` semantic |
| **State: stateInitial, stateChange** | **Purple** `#BD93F9` | **State is component constant/data** - matches `constant` scope (purple) |
| **Logs: logStatements** | **Green** `#50FA7B` | **Log is a function call** - matches `entity.name.function` scope |
| **Warnings: warnStatements, identicalStateValueWarning, identicalPropValueWarning** | **Yellow** `#F1FA8C` | **Warnings are highlighted alerts** - matches `log.warning` scope (yellow + bold) |
| **Errors: errorStatements** | **Red** `#FF5555` | **Errors are invalid states** - matches `invalid`, `log.error` scope (red + bold) |
| **Metadata: reconciled, skipped** | **Comment Gray** `#6272A4` | **Reconciled/skipped are background metadata** - matches `comment` scope (gray) |

## AutoTracer Flow Semantic Mapping

| Category | Dracula Mapping | Rationale |
|----------|-----------------|-----------|
| **Async: asyncStart, asyncComplete** | **Green** `#50FA7B` **+ italic** | **Async operations are function calls** - matches `entity.name.function` scope (green) with italic to distinguish from synchronous functions |
| **Functions: functionEnter, functionExit** | **Green** `#50FA7B` | **Primary execution functions** - matches `entity.name.function` scope (green) |
| **Parameters: parameter** | **Orange** `#FFB86C` | **Parameters are function inputs** - matches `variable.parameter` scope (orange + italic) |
| **Returns: returnValue** | **Cyan** `#8BE9FD` | **Return values define function output** - matches `entity.name.type` scope (cyan), creating visual data flow: orange inputs → green execution → cyan outputs |
| **Exceptions: exception** | **Red** `#FF5555` | **Exceptions are errors** - matches `invalid`, `log.error` scope (red + bold) |
| **Runtime Control: runtimeControl** | **Comment Gray** `#6272A4` | **Runtime metadata** - matches `comment` scope (gray) |

## Design Rationale

### Why These Mappings?

1. **Function Recognition**: Green (`#50FA7B`) is Dracula's function color - users see green when they write `function foo()` in their editor. AutoTracer functions and async operations should feel the same.

2. **Parameter Consistency**: Orange (`#FFB86C`) with italic is Dracula's parameter style - users see orange italic when they write `function(param1, param2)`. AutoTracer should maintain this mental model.

3. **State as Constants**: Purple (`#BD93F9`) is Dracula's constant color - React state is conceptually constant data that triggers updates. This aligns with `const` declarations in code.

4. **Props as Types**: Cyan (`#8BE9FD`) is Dracula's type/class color - props define the "type" or "interface" of a component. This semantic fits perfectly.

5. **Keywords for Renders**: Pink (`#FF79C6`) is Dracula's keyword color - rendering is a lifecycle "event" or "keyword moment" in React's execution model.

6. **Warnings Stand Out**: Yellow (`#F1FA8C`) with bold makes warnings visible but not alarming - matches how Dracula treats warning-level log output.

7. **Metadata Recedes**: Comment gray (`#6272A4`) for reconciled/skipped traces - these are "under the hood" details, like comments in code.

## Color Psychology

Dracula's vibrant palette:
- **Green/Cyan/Purple**: Active execution (functions, types, constants)
- **Pink/Orange**: Control flow and inputs (keywords, parameters)
- **Yellow**: Output and alerts (strings, warnings)
- **Red**: Critical errors
- **Gray**: Background information

This creates a natural visual hierarchy: active code is bright (green/cyan/pink), data flow is warm (orange/yellow), errors are red, metadata is muted (gray).

## Accessibility Notes

- High contrast ratios throughout
- Distinct hues for colorblind users (green/pink/purple/orange are perceptually distinct)
- Bold weights for warnings/errors add redundant encoding
- Gray is sufficiently muted to recede without disappearing

## Implementation Strategy

**Bold Usage:**
- Warnings: bold weight (visual emphasis)
- Errors: bold weight (critical emphasis)
- Async operations: bold weight (execution emphasis)
- All other categories: normal weight

**Italic Usage:**
- Parameters: italic (matches editor convention)
- Async operations: italic (distinguishes from synchronous functions)

**Color Grouping:**
- Execution flow: Green (`#50FA7B`) - functions, async, logs
- Component data: Cyan/Purple (`#8BE9FD`, `#BD93F9`) - props, state
- Lifecycle events: Pink (`#FF79C6`) - renders
- Data flow: Orange → Green → Cyan (`#FFB86C` → `#50FA7B` → `#8BE9FD`) - parameters → execution → returns
- Issues: Red/Yellow (`#FF5555`, `#F1FA8C`) - errors, warnings
- Metadata: Gray (`#6272A4`) - reconciled, skipped, runtime control

---

**Key Principle**: Users should recognize AutoTracer output based on the same semantic meaning they see in their editor code. If they see green functions in VSCode, they should see green function traces in AutoTracer output.
