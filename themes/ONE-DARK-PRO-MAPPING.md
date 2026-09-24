# One Dark Pro Theme Color Mapping to AutoTracer Semantic Categories

This document maps One Dark Pro VSCode theme colors to AutoTracer's Flow and React18 semantic categories.

**Core Philosophy**: Users should recognize AutoTracer output based on the same semantic meaning they see in their editor code.

---

## Semantic Analysis: What Users Recognize

Looking at the One Dark Pro theme JSON semantically:

### Core Semantic Token Mappings (from theme JSON)

1. **Functions/Methods** - `#61afef` (blue)

   - `entity.name.function`, `support.function.console`, `meta.function-call.generic.python`
   - `meta.method.java`, `meta.method.groovy`

2. **Keywords/Control Flow** - `#c678dd` (magenta/purple)

   - `keyword`, `keyword.control`, `storage`
   - `keyword.operator.new`, `keyword.operator.expression.typeof`

3. **Types/Classes** - `#e5c07b` (yellow)

   - `entity.name.type`, `entity.name.class`, `support.class`
   - `support.type.primitive.ts`, `storage.type.java`
   - `variable.language` (this, self, super)

4. **Variables/Properties** - `#e06c75` (red)

   - `variable`, `variable.other.readwrite`, `meta.object-literal.key`
   - `support.variable.property`, `entity.name.tag`
   - `meta.definition.variable.name.java`

5. **Strings** - `#98c379` (green)

   - `string`

6. **Constants/Numbers** - `#d19a66` (orange)

   - `constant`, `constant.numeric`
   - `constant.character.format.placeholder.other.python`

7. **Operators** - `#56b6c2` (cyan)

   - `keyword.operator.logical`, `keyword.operator.comparison`
   - `keyword.operator.arithmetic`, `support.function`

8. **Function Parameters** - Complex mapping based on language context
   - **Python**: `variable.parameter.function.language.python` → `#d19a66` (orange)
   - **Python special**: `variable.parameter.function.language.special.self.python`, `.cls.python` → `#e5c07b` (yellow)
   - **JS/TS specific**: `variable.parameter.function.js` → `#e06c75` (red)
   - **General fallback**: `variable.parameter.function` → `#abb2bf` (gray)
   - **Ruby/C#**: `function.parameter.ruby`, `function.parameter.cs` → `#abb2bf` (gray)
   - **Java**: `token.variable.parameter.java` → `#abb2bf` (gray)

   **From screenshot**: TypeScript parameters (`hello`, `c`, `a`) appear red/magenta, confirming JS/TS uses `#e06c75` or possibly inheriting from variable color

9. **Comments** - `#7f848e` or `#5c6370` (gray)

   - `comment`, `comment markup.link`

10. **Log Output Tokens**
    - `log.info` → `#98c379` (green)
    - `log.warning` → `#e5c07b` (yellow)
    - `log.error` → `#e06c75` (red)
    - `token.warn-token` → `#d19a66` (orange)
    - `token.error-token` → `#f44747` (bright red)

---

## Flow Tracing Category Mappings

| AutoTracer Category | Semantic Intent            | Editor Analogy                            | Suggested Color          | Rationale                                                                                           |
| ------------------- | -------------------------- | ----------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------- |
| `functionEnter`     | Function execution start   | **Function name** when calling it         | **#61afef** (blue)       | Matches `entity.name.function` - user sees blue function names                                      |
| `functionExit`      | Function execution end     | **Function name** when returning          | **#61afef** (blue)       | **Must match functionEnter** (lifecycle pair)                                                       |
| `asyncStart`        | Async function start       | **`async` keyword + function name**       | **#61afef** (blue)       | `async` is purple keyword, but function name is blue - use blue for consistency with sync functions |
| `asyncComplete`     | Async function complete    | **`async` keyword + function name**       | **#61afef** (blue)       | **Must match asyncStart** (lifecycle pair)                                                          |
| `parameter`         | Function parameter values  | **Parameter names** in function signature | **#d19a66** (orange) | Python/general uses orange, more distinct than gray; JS/TS may show red but orange is clearer |
| `returnValue`       | Return value from function | **`return` statement value**              | **#98c379** (green)      | Returned values are often strings/data - green conveys "output"                                     |
| `exception`         | Exceptions thrown          | **Error in console**                      | **#e06c75** (red) + bg   | Matches `log.error`, `markup.deleted` - errors are red                                              |
| `runtimeControl`    | Runtime control messages   | **System/framework messages**             | **#5c6370** (dark gray)  | Subdued like comments, not user code                                                                |

### Flow Semantic Rationale

- **Functions are blue** - Users see function names as blue in their editor, so function enter/exit should be blue
- **Async uses same blue** - The `async` keyword is purple, but the function name is still blue - keep execution flow unified
- **Parameters are orange** - Python explicitly uses orange; provides better distinction from variables than gray
- **Returns are green** - Output data, like strings (green in editor)
- **Errors are red** - Universal error color

---

## React18 Tracing Category Mappings

| AutoTracer Category          | Semantic Intent         | Editor Analogy                       | Suggested Color           | Rationale                                                            |
| ---------------------------- | ----------------------- | ------------------------------------ | ------------------------- | -------------------------------------------------------------------- |
| `definitiveRender`           | Component render event  | **Component function being called**  | **#61afef** (blue)        | `entity.name.function` - function names are blue                     |
| `propInitial`                | Initial prop values     | **Object properties** (initial read) | **#e06c75** (red) italic  | `meta.object-literal.key` - properties are red, italic for "initial" |
| `propChange`                 | Prop changes            | **Object properties** (mutation)     | **#e06c75** (red)         | Same as propInitial - properties are red                             |
| `stateInitial`               | Initial state values    | **Variable declarations** (initial)  | **#e06c75** (red) italic  | `variable` - variables are red, italic for "initial"                 |
| `stateChange`                | State changes           | **Variable assignments** (mutation)  | **#e06c75** (red)         | `variable.other.readwrite` - variables are red                       |
| `logStatements`              | console.log output      | **String literals / log.info**       | **#98c379** (green)       | `log.info` → green, strings are green                                |
| `warnStatements`             | console.warn output     | **Warning tokens**                   | **#e5c07b** (yellow)      | `log.warning` → yellow in theme JSON                                 |
| `errorStatements`            | console.error output    | **Error tokens**                     | **#e06c75** (red) + bg    | `log.error` → red, **must match Flow exception**                     |
| `reconciled`                 | Reconciliation events   | **Comment/metadata**           | **#5c6370** (dark gray)   | Informational, like comments - not primary user code                 |
| `skipped`                    | Skipped renders         | **Comment/metadata**           | **#5c6370** (dark gray)   | Same as reconciled - informational metadata                          |
| `identicalStateValueWarning` | Identical state warning | **Warning about variables**          | **#e5c07b** (yellow) bold | `log.warning` color, bold for attention                              |
| `identicalPropValueWarning`  | Identical prop warning  | **Warning about properties**         | **#e5c07b** (yellow) bold | `log.warning` color, bold for attention                              |

### React Semantic Rationale

- **Component renders are blue** - `entity.name.function` - functions are blue
- **Props and state are BOTH red** - Both are variables/properties in the theme
- **Warnings use yellow** - `log.warning` is explicitly yellow (#e5c07b) in theme JSON
- **Logs are green** - `log.info` is green, strings are green
- **Errors are red** - `log.error` is red, matches Flow
- **Reconciled/skipped are gray** - Informational metadata like comments, not primary user code

---

## Comparison Tables by Semantic Grouping

### Execution Flow (Functions/Renders)

| Grouping              | Flow Categories                 | Editor Semantic        | Suggested Color         | React Categories   | Editor Semantic           | Suggested Color         |
| --------------------- | ------------------------------- | ---------------------- | ----------------------- | ------------------ | ------------------------- | ----------------------- |
| **Sync Functions**    | `functionEnter`, `functionExit` | Function names         | **#61afef** (blue) bold | N/A                | N/A                       | N/A                     |
| **Async Functions**   | `asyncStart`, `asyncComplete`   | `async` function names | **#61afef** (blue) bold | N/A                | N/A                       | N/A                     |
| **Component Renders** | N/A                             | N/A                    | N/A                     | `definitiveRender` | Component (function) name | **#61afef** (blue) bold |

**Semantic Unity**: All are function executions. Functions are blue in the editor, so all execution boundaries should be blue.

---

### Data/Variables

| Grouping          | Flow Categories | Editor Semantic     | Suggested Color           | React Categories              | Editor Semantic   | Suggested Color                       |
| ----------------- | --------------- | ------------------- | ------------------------- | ----------------------------- | ----------------- | ------------------------------------- |
| **Parameters**    | `parameter`     | Parameter names     | **#abb2bf** (gray) italic | N/A                           | N/A               | N/A                                   |
| **Props**         | N/A             | N/A                 | N/A                       | `propInitial`, `propChange`   | Object properties | **#e06c75** (red), italic for initial |
| **State**         | N/A             | N/A                 | N/A                       | `stateInitial`, `stateChange` | Variables         | **#e06c75** (red), italic for initial |
| **Return Values** | `returnValue`   | Data being returned | **#98c379** (green)       | N/A                           | N/A               | N/A                                   |

**Semantic Unity**: Props and state are both variables/properties (red in editor). Parameters are subdued (gray). Returns are output data (green like strings).

---

### Console/Logging

| Grouping      | Flow Categories | Editor Semantic | Suggested Color        | React Categories  | Editor Semantic | Suggested Color        |
| ------------- | --------------- | --------------- | ---------------------- | ----------------- | --------------- | ---------------------- |
| **Info Logs** | N/A             | N/A             | N/A                    | `logStatements`   | String messages | **#98c379** (green)    |
| **Warnings**  | N/A             | N/A             | N/A                    | `warnStatements`  | Warning tokens  | **#d19a66** (orange)   |
| **Errors**    | `exception`     | Error messages  | **#e06c75** (red) + bg | `errorStatements` | Error messages  | **#e06c75** (red) + bg |

**Semantic Unity**: Errors must be identical (red). Warnings use orange (warning token color). Logs use green (string color).

---

### Special Cases

| Grouping               | Flow Categories  | Editor Semantic   | Suggested Color    | React Categories                                          | Editor Semantic    | Suggested Color           |
| ---------------------- | ---------------- | ----------------- | ------------------ | --------------------------------------------------------- | ------------------ | ------------------------- |
| **System Messages**    | `runtimeControl` | Comments/metadata | **#5c6370** (gray) | N/A                                                       | N/A                | N/A                       |
| **Optimization**       | N/A              | N/A               | N/A                | `reconciled`, `skipped`                                   | Success indicators | **#98c379** (green)       |
| **Developer Warnings** | N/A              | N/A               | N/A                | `identicalStateValueWarning`, `identicalPropValueWarning` | Warning messages   | **#d19a66** (orange) bold |

---

## One Dark Pro Token Color Reference

For easy lookup when extending themes:

| Color          | Hex       | Primary Use Cases                                    |
| -------------- | --------- | ---------------------------------------------------- |
| **Blue**       | `#61afef` | Functions, methods, imports, links, token.info-token |
| **Magenta**    | `#c678dd` | Keywords, storage, operators, markup.italic          |
| **Yellow**     | `#e5c07b` | Types, classes, language variables, constants        |
| **Orange**     | `#d19a66` | Numbers, attributes, constants, token.warn-token     |
| **Green**      | `#98c379` | Strings, markup.inserted, log.info                   |
| **Cyan**       | `#56b6c2` | Operators, regex, support.function, constants        |
| **Red**        | `#e06c75` | Variables, tags, deleted, errors, log.error          |
| **Light Gray** | `#abb2bf` | Default text, punctuation, operators                 |
| **Dark Gray**  | `#5c6370` | Comments, dimmed elements, markup.quote              |
| **White**      | `#ffffff` | Invalid/illegal tokens                               |

---

## Design Decisions

### Why These Mappings?

1. **Flow functions (cyan) vs React renders (blue)**

   - Both are bold lifecycle boundaries
   - Cyan and blue are both cool colors in same family
   - Similar visual weight, distinct enough to tell apart
   - Groups all execution flow boundaries together

2. **Flow async (cyan+italic) vs Flow sync (cyan)**

   - Same color emphasizes they're both execution flow
   - Italic styling distinguishes async from sync
   - Lifecycle pairs match (start/complete both italic, enter/exit both not italic)

3. **Flow parameters (dark gray) vs React props (magenta)**

   - Parameters are implementation details (subdued gray)
   - Props are component API (vibrant magenta)
   - Reflects different importance levels

4. **Shared green for logs and returns**

   - Green = success/output/information
   - Consistent across both tracers
   - Non-threatening, calming

5. **Shared red for errors**
   - Semantic requirement: errors must look the same
   - Maximum visibility with background color
   - Bold to draw immediate attention

### Temperature Strategy

- **Flow**: Cool unified palette - cyan for all execution flow (functions + async), green for output, gray for detail
- **React**: Cool primary (blue renders) with warm accents (magenta props, yellow state), shared neutrals (green logs, red errors)
- **Result**: Execution flow boundaries are visually unified across both tracers (cyan/blue family), while data flow uses distinct colors (props, state)

---

## Validation Checklist

When creating or updating themes:

- [ ] Flow `functionEnter` and `functionExit` use same color + bold (✅ #56b6c2)
- [ ] Flow `asyncStart` and `asyncComplete` use same color + bold + italic (✅ #56b6c2 + italic)
- [ ] Flow exception and React errorStatements use same color + bold + bg (✅ #e06c75)
- [ ] React `propInitial` and `propChange` share color family (✅ #c678dd)
- [ ] React `stateInitial` and `stateChange` share color family (✅ #e5c07b)
- [ ] React prop color differs from state color (✅ magenta vs yellow)
- [ ] Flow execution boundaries (functions, async) unified in cyan family (✅ #56b6c2)
- [ ] React renders in same cool family as Flow (✅ blue #61afef similar to cyan #56b6c2)
- [ ] Initial values use italic (✅ propInitial, stateInitial)
- [ ] Identical warnings use bold in respective colors (✅ yellow/magenta bold)

---

## Future Extensions

If One Dark Pro adds new semantic tokens, consider these mappings:

| Potential New Token                | Suggested AutoTracer Category                            | Rationale                     |
| ---------------------------------- | -------------------------------------------------------- | ----------------------------- |
| `entity.name.function.async`       | Flow `asyncStart`/`asyncComplete`                        | Direct async function mapping |
| `variable.other.property.readonly` | React `propInitial`                                      | Immutable props concept       |
| `variable.other.property.mutable`  | React `stateChange`                                      | Mutable state concept         |
| `support.function.builtin.console` | React `logStatements`/`warnStatements`/`errorStatements` | Console output family         |
| `keyword.control.flow.return`      | Flow `returnValue`                                       | Return statement highlighting |

---

## License

MIT - Same as AutoTracer theme files
