# Light+ Theme - Semantic Mapping for AutoTracer

## Theme Overview

Light+ is Microsoft's default light theme for Visual Studio Code. It provides a clean, professional color scheme optimized for bright environments with high readability and excellent contrast.

### Core Palette

| Color       | Hex       | Semantic Meaning                                      |
| ----------- | --------- | ----------------------------------------------------- |
| Dark Yellow | `#795E26` | Functions, methods                                    |
| Teal        | `#267F99` | Types, classes, interfaces                            |
| Blue        | `#0451a5` | Variables, properties, parameters (enhanced contrast) |
| Pure Blue   | `#0000ff` | Keywords, control flow, storage                       |
| Brown-Red   | `#a31515` | Strings                                               |
| Red         | `#cd3131` | Errors, invalid states                                |
| Green       | `#098658` | Numbers, constants                                    |
| Dark Green  | `#008000` | Comments                                              |
| Black       | `#000000` | Default foreground, operators                         |

## Core Semantic Token Mappings

### From Theme Analysis

**Functions & Methods:**

```yaml
scope: entity.name.function, support.function
foreground: #795E26  # Dark Yellow
```

**Parameters:**

```yaml
scope: variable.parameter
foreground: #0451a5  # Blue (enhanced contrast)
```

**Variables & Properties:**

```yaml
scope: variable, variable.other.readwrite
foreground: #0451a5  # Blue
# Note: CSS/LESS properties use #e50000 (red)
```

**Constants:**

```yaml
scope: constant.language
foreground: #0000ff  # Pure Blue
# constant.numeric uses #098658 (green)
```

**Keywords & Control Flow:**

```yaml
scope: keyword, storage, storage.type, storage.modifier
foreground: #0000ff  # Pure Blue
```

**Types & Classes:**

```yaml
scope: entity.name.type, entity.name.class, support.class, support.type
foreground: #267F99  # Teal
```

**Strings:**

```yaml
scope: string
foreground: #a31515  # Brown-Red
```

**Comments:**

```yaml
scope: comment
foreground: #008000  # Dark Green
```

**Errors:**

```yaml
scope: invalid
foreground: #cd3131  # Red
fontStyle: (varies by context)
```

**Warnings:**

```yaml
scope: log.warning
foreground: #bf8803  # Dark Gold (estimated, not in base theme)
```

## AutoTracer React18 Semantic Mapping

| Category                                                                            | Light+ Mapping            | Rationale                                                                             |
| ----------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------- |
| **Lifecycle: definitiveRender**                                                     | **Pure Blue** `#0000ff`   | **Render is a keyword/control flow event** - matches `keyword` scope (pure blue)      |
| **Props: propInitial, propChange**                                                  | **Teal** `#267f99`        | **Props are component types/interfaces** - matches `entity.name.type` semantic (teal) |
| **State: stateInitial, stateChange**                                                | **Blue** `#0451a5`        | **State is component variable data** - matches `variable` scope (blue)                |
| **Logs: logStatements**                                                             | **Dark Yellow** `#795e26` | **Log is a function call** - matches `entity.name.function` scope                     |
| **Warnings: warnStatements, identicalStateValueWarning, identicalPropValueWarning** | **Brown-Red** `#a31515`   | **Warnings need visibility** - uses string color (brown-red + bold)                   |
| **Errors: errorStatements**                                                         | **Red** `#cd3131`         | **Errors are invalid states** - matches `invalid` semantic (red + bold)               |
| **Metadata: reconciled, skipped**                                                   | **Dark Green** `#008000`  | **Reconciled/skipped are background metadata** - matches `comment` scope (dark green) |

## AutoTracer Flow Semantic Mapping

| Category                                   | Light+ Mapping                         | Rationale                                                                                                                                                              |
| ------------------------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Async: asyncStart, asyncComplete**       | **Dark Yellow** `#795e26` **+ italic** | **Async operations are function calls** - matches `entity.name.function` scope (dark yellow) with italic to distinguish from synchronous functions                     |
| **Functions: functionEnter, functionExit** | **Dark Yellow** `#795e26`              | **Primary execution functions** - matches `entity.name.function` scope (dark yellow)                                                                                   |
| **Parameters: parameter**                  | **Blue** `#0451a5`                     | **Parameters are function inputs** - matches `variable.parameter` scope (blue + italic)                                                                                |
| **Returns: returnValue**                   | **Teal** `#267f99`                     | **Return values define function output type** - matches `entity.name.type` scope (teal), creating visual data flow: blue inputs → dark yellow execution → teal outputs |
| **Exceptions: exception**                  | **Red** `#cd3131`                      | **Exceptions are errors** - matches `invalid` semantic (red + bold)                                                                                                    |
| **Runtime Control: runtimeControl**        | **Dark Green** `#008000`               | **Runtime metadata** - matches `comment` scope (dark green)                                                                                                            |

## Design Rationale

### Why These Mappings?

1. **Function Recognition**: Dark yellow (`#795e26`) is Light+'s function color - users see dark yellow when they write `function foo()` in their editor. AutoTracer functions and async operations should feel the same.

2. **Parameter Consistency**: Blue (`#0451a5`) with italic is Light+'s parameter/variable style - users see blue when they write `function(param1, param2)`. AutoTracer should maintain this mental model.

3. **State as Variables**: Blue (`#0451a5`) is Light+'s variable color - React state is component variable data. This aligns with variable declarations in code.

4. **Props as Types**: Teal (`#267f99`) is Light+'s type/class color - props define the "interface" or "type" of a component. This semantic fits perfectly.

5. **Keywords for Renders**: Pure blue (`#0000ff`) is Light+'s keyword color - rendering is a lifecycle "event" or "keyword moment" in React's execution model.

6. **Warnings Stand Out**: Brown-red (`#a31515`) with bold makes warnings clearly visible - reusing the string color ensures visibility without alarm.

7. **Metadata Recedes**: Dark green (`#008000`) for reconciled/skipped traces - these are "under the hood" details, like comments in code.

## Color Psychology

Light+'s clean, professional palette:

- **Dark Yellow/Teal**: Active code (functions, types)
- **Pure Blue**: Control flow (keywords, renders)
- **Blue**: Data (variables, parameters, state)
- **Brown-Red**: Strings and warnings
- **Red**: Critical errors
- **Dark Green/Green**: Background information (comments, metadata, constants)

This creates a natural visual hierarchy: execution is earthy (dark yellow), structure is aquatic (teal), data is calm blue, flow control is vibrant (pure blue), issues are red/brown-red, metadata is natural (green).

## Accessibility Notes

- High contrast ratios throughout (optimized for light backgrounds)
- Colors selected for maximum readability against white
- Distinct hues work well for colorblind users
- Bold weights for warnings/errors add redundant encoding
- Green is distinct yet subdued for metadata

## Light Mode Considerations

Light+ requires **darker, more saturated colors** than dark themes to maintain visibility:

1. **Functions**: Dark yellow instead of bright yellow
2. **Variables**: Black instead of light colors
3. **Errors**: Bright orange-red for maximum visibility
4. **All colors**: Higher saturation and darker values
5. **Contrast**: WCAG AAA compliance for most tokens

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

- Execution flow: Dark Yellow (`#795e26`) - functions, async, logs
- Component structure: Teal (`#267f99`) - props, return values
- Component data: Blue (`#0451a5`) - state, parameters
- Lifecycle events: Pure Blue (`#0000ff`) - renders
- Data flow: Blue → Dark Yellow → Teal (`#0451a5` → `#795e26` → `#267f99`) - parameters → execution → returns
- Issues: Red/Brown-Red (`#cd3131`, `#a31515`) - errors, warnings
- Metadata: Dark Green (`#008000`) - reconciled, skipped, runtime control

---

**Key Principle**: Users should recognize AutoTracer output based on the same semantic meaning they see in their editor code. If they see dark yellow functions in VS Code, they should see dark yellow function traces in AutoTracer output.

## Theme Consistency

Light+ uses a **high-contrast, professional approach**:

- Functions are prominent (dark yellow)
- Types define structure (teal)
- Variables hold data (blue - excellent readability)
- Keywords control flow (pure blue - vibrant)
- Errors demand immediate attention (red)
- Metadata stays subtle (dark green)

AutoTracer's mapping respects this hierarchy, ensuring developers instantly recognize the semantic meaning of traced output.

## Dark+ vs Light+ Pairing

When switching between Dark+ and Light+ themes, the **semantic mappings remain consistent**:

| Semantic Category | Dark+ Color          | Light+ Color          | Consistency                       |
| ----------------- | -------------------- | --------------------- | --------------------------------- |
| Functions         | Yellow `#dcdcaa`     | Dark Yellow `#795e26` | ✅ Same hue family                |
| Types             | Blue-Green `#4ec9b0` | Teal `#267f99`        | ✅ Same hue family                |
| Variables         | Light Blue `#9cdcfe` | Blue `#0451a5`        | ✅ Both blue family               |
| Keywords          | Blue `#569cd6`       | Pure Blue `#0000ff`   | ✅ Both blue, adjusted brightness |
| Errors            | Red `#f48771`        | Red `#cd3131`         | ✅ Same semantic (danger)         |
| Comments          | Green `#6a9955`      | Dark Green `#008000`  | ✅ Same hue family                |

This pairing ensures developers can switch themes without cognitive disruption - the semantic meaning remains visually consistent.
