# AutoTracer Theme Semantic Color Specification

**Source of Truth References:**
- React Categories: `packages\auto-tracer-react18\src\lib\functions\styledLogger\ColorPalette.ts`
- Flow Categories: `packages\auto-tracer-flow\src\lib\types\FlowThemeConfig.ts`

---

## Authoritative Category Lists

### Flow Tracing Categories (8 total)

1. `asyncStart` - Async function start messages
2. `asyncComplete` - Async function completion messages
3. `functionEnter` - Synchronous function entry (group start)
4. `functionExit` - Synchronous function exit (elapsed time)
5. `parameter` - Parameter logging
6. `returnValue` - Return value logging
7. `exception` - Exception logging
8. `runtimeControl` - Runtime control messages

### React Tracing Categories (12 total)

1. `definitiveRender` - Definitive component render event
2. `propChange` - Prop change detection
3. `propInitial` - Initial prop values
4. `stateChange` - State change detection
5. `stateInitial` - Initial state values
6. `logStatements` - Console.log statements
7. `warnStatements` - Console.warn statements
8. `errorStatements` - Console.error statements
9. `reconciled` - Reconciliation events
10. `skipped` - Skipped render events
11. `identicalStateValueWarning` - Identical state value warnings
12. `identicalPropValueWarning` - Identical prop value warnings

---

## Purpose

This document defines semantic groupings and color rules for AutoTracer theme categories. Use these guidelines to ensure consistency and meaningful visual communication across both Flow and React tracing output.

**Core principle:** Lifecycle pairs (enter/exit, start/complete) must be visually cohesive (same color, same bold, may differ in italic).

---

## Semantic Groupings

These semantic groupings help organize the 20 actual categories into meaningful color families. Categories within a group should follow similar visual patterns.

**Note:** Groups 1-2 are lifecycle pairs where both events MUST share color and bold settings.

### 1. Function Call Lifecycle

**Intent:** Function execution from entry to exit
**Visual Weight:** Bold, same color for enter/exit
**Italic:** May differ between enter and exit

**Flow Events:**

- `functionEnter`
- `functionExit`

**React Events:**

- _(Not applicable)_

**Color Constraints:**

- `functionEnter` and `functionExit` MUST use the same color
- `functionEnter` and `functionExit` MUST be bold
- MAY differ in italic (e.g., enter bold, exit bold+italic)
- Should be visually cohesive as a pair
- Bold styling creates clear visual grouping in console output

**Default Values (Monochrome):**

- `functionEnter`: bold, icon: →
- `functionExit`: bold, icon: ←

---

### 2. Async Operation Lifecycle

**Intent:** Asynchronous operation from start to completion
**Visual Weight:** Bold, same color for start/complete
**Italic:** May differ between start and complete

**Flow Events:**

- `asyncStart`
- `asyncComplete`

**React Events:**

- _(Not applicable)_

**Color Constraints:**

- `asyncStart` and `asyncComplete` MUST use the same color
- `asyncStart` and `asyncComplete` MUST be bold
- MAY differ in italic (e.g., start bold, complete bold+italic)
- Should be distinct from synchronous function calls
- Bold styling creates clear visual grouping in console output

**Default Values (Monochrome):**

- `asyncStart`: bold, icon: 🚀
- `asyncComplete`: bold, icon: ✅

---

### 3. Component Render Entry

**Intent:** Definitive component render event
**Visual Weight:** Bold, prominent color
**Italic:** Never

**Flow Events:**

- _(Not applicable)_

**React Events:**

- `definitiveRender`

**Color Constraints:**

- MUST be bold
- Should be highly visible (typically blue or warm color)
- Is the authoritative render event

**Default Values (Dark Mode):**

- `definitiveRender`: color: #4fd6ff (bright blue), bold: true

---

### 4. Data Change Detection

**Intent:** Tracking prop and state mutations
**Visual Weight:** Normal, attention-drawing
**Italic:** Never

**Flow Events:**

- _(Not applicable)_

**React Events:**

- `propChange` - Prop changes
- `stateChange` - State changes
- `propInitial` - Initial prop values
- `stateInitial` - Initial state values

**Color Constraints:**

- `propChange` and `propInitial` should share color family
- `stateChange` and `stateInitial` should share color family
- State color should differ from prop color (typically yellow vs purple)
- Initial values MAY be subdued compared to changes

**Default Values (Dark Mode):**

- `propInitial`: color: #ff77e8 (magenta), italic: true
- `propChange`: color: #ff77e8 (magenta)
- `stateInitial`: color: #ffcf33 (orange), italic: true
- `stateChange`: color: #ffcf33 (orange)

---

### 5. External Data Flow (Parameters)

**Intent:** Function parameter values
**Visual Weight:** Subdued
**Italic:** Allowed (recommended)

**Flow Events:**

- `parameter`

**React Events:**

- _(Not applicable)_

**Color Constraints:**

- Parameters SHOULD be italic and subdued (gray)
- Should visually distinguish from other data types

**Default Values (Monochrome):**

- `parameter`: italic: true

---

### 6. Return Values and Output

**Intent:** Data leaving a function
**Visual Weight:** Normal
**Italic:** Never

**Flow Events:**

- `returnValue`

**React Events:**

- _(Not applicable)_

**Color Constraints:**

- Should be distinct from inputs (typically cyan)

**Default Values (Monochrome):**

- `returnValue`: (no styling)

---

### 7. Error and Warning Messages

**Intent:** Exception handling and console output
**Visual Weight:** Bold for errors/exceptions, normal for warnings
**Italic:** Never

**Flow Events:**

- `exception`

**React Events:**

- `errorStatements` - console.error output
- `warnStatements` - console.warn output
- `logStatements` - console.log output

**Color Constraints:**

- `exception` and `errorStatements` MUST be bold
- `exception` and `errorStatements` MUST use same color (red)
- `exception` and `errorStatements` SHOULD have background color
- `warnStatements` should be orange/amber, not bold
- `logStatements` should be neutral, not bold

**Default Values (Dark Mode):**

- `exception`: bold: true, icon: 💥
- `errorStatements`: color: #f0dfd2 (light red), background: #473635 (dark red), bold: true
- `warnStatements`: color: #f9f2a3 (yellow), background: #3f3c28 (dark yellow)
- `logStatements`: color: #4ade80 (green)

---

### 8. Render Control Events

**Intent:** Render optimization and reconciliation
**Visual Weight:** Normal, calming
**Italic:** Never

**Flow Events:**

- _(Not applicable)_

**React Events:**

- `reconciled` - Reconciliation events
- `skipped` - Skipped render events

**Color Constraints:**

- Should convey optimization/success (typically green)
- Both should share similar color family

**Default Values (Dark Mode):**

- `reconciled`: color: #9ca3af (gray)
- `skipped`: color: #9ca3af (gray)

---

### 9. Developer Warnings

**Intent:** AutoTracer-specific warnings for developers
**Visual Weight:** Attention-drawing
**Italic:** Never

**Flow Events:**

- _(Not applicable)_

**React Events:**

- `identicalStateValueWarning` - Warns about identical state updates
- `identicalPropValueWarning` - Warns about identical prop values

**Color Constraints:**

- Should be distinct from errors (not red)
- Should be noticeable (typically orange/amber)
- Both warnings should share same color

**Default Values (Dark Mode):**

- `identicalStateValueWarning`: color: #ffcf33 (orange), bold: true
- `identicalPropValueWarning`: color: #ff77e8 (magenta), bold: true

---

### 10. Runtime Control/System Events

**Intent:** Framework or runtime operations
**Visual Weight:** Normal, subdued
**Italic:** Never

**Flow Events:**

- `runtimeControl`

**React Events:**

- _(Not applicable)_

**Color Constraints:**

- Should be neutral and subdued (typically gray or orange)

**Default Values (Monochrome):**

- `runtimeControl`: (no styling), icon: 🔧

---

## Color Mapping Rules

### MUST Rules (Enforce Consistency)

1. **Function enter and exit** MUST use:
   - Same color
   - Same bold setting
   - MAY differ in italic only

2. **Async start and complete** MUST use:
   - Same color
   - Same bold setting
   - MAY differ in italic only

3. **Errors and exceptions** (`exception`, `errorStatements`) MUST use:
   - Same color (red)
   - Bold styling
   - Background color

4. **Prop changes and initial props** should share color family

5. **State changes and initial state** should share color family

6. **Identical value warnings** (`identicalStateValueWarning`, `identicalPropValueWarning`) should share color

### MAY Rules (Flexibility)

1. Parameters SHOULD be italic and subdued (gray)
2. Initial values (`propInitial`, `stateInitial`) MAY be subdued compared to change events
3. Runtime control messages MAY share color with warnings or remain neutral gray
4. Async lifecycle MAY share color with entries OR use distinct color for differentiation

### Color Distinctness

The following categories **must** be visually distinct:

- Function call lifecycle (enter/exit, bold) vs Async lifecycle (start/complete, bold)
- Function/async lifecycles (both bold) vs Component render (definitiveRender, bold)
- Errors/exceptions (red, bold, bg) vs Warnings (orange, not bold)
- State changes vs Prop changes
- Console statements (`logStatements`, `warnStatements`, `errorStatements`) must be visually distinct
- Developer warnings (`identicalStateValueWarning`, `identicalPropValueWarning`) vs console warnings

**Note:** Since function lifecycle, async lifecycle, component render, and errors are all bold, color choice becomes critical for instant differentiation.

---

## Theme Creation Checklist

When creating a new theme:

- [ ] `functionEnter` and `functionExit` use same color and bold (may differ in italic)
- [ ] `asyncStart` and `asyncComplete` use same color and bold (may differ in italic)
- [ ] `exception` and `errorStatements` use same color + bold + background (red)
- [ ] `definitiveRender` is bold and prominent
- [ ] `propChange` and `propInitial` share color family
- [ ] `stateChange` and `stateInitial` share color family
- [ ] State color family differs from prop color family
- [ ] `warnStatements` is distinct from errors (orange, not bold)
- [ ] `logStatements` is neutral
- [ ] `reconciled` and `skipped` share color family (green)
- [ ] `identicalStateValueWarning` and `identicalPropValueWarning` share color
- [ ] `parameter` is italic and subdued
- [ ] Theme has been tested in both Flow and React contexts

---

## Example Mappings

### One Dark Pro Color Assignments

| Semantic Grouping           | Color                         | Bold | Italic  | Categories                                                    |
| --------------------------- | ----------------------------- | ---- | ------- | ------------------------------------------------------------- |
| Function Call Lifecycle     | `#61afef` (blue)              | Yes  | Allowed | `functionEnter`, `functionExit`                               |
| Async Operation Lifecycle   | `#c678dd` (purple)            | Yes  | Allowed | `asyncStart`, `asyncComplete`                                 |
| Component Render Entry      | `#61afef` (blue)              | Yes  | No      | `definitiveRender`                                            |
| Data Changes                | `#e5c07b` (yellow) / `#c678dd` (purple) | No   | No      | `stateChange`, `stateInitial`, `propChange`, `propInitial`    |
| External Data Flow          | `#abb2bf` (gray)              | No   | Yes     | `parameter`                                                   |
| Return/Output               | `#56b6c2` (cyan)              | No   | No      | `returnValue`                                                 |
| Errors/Exceptions           | `#e06c75` (red)               | Yes  | No      | `exception`, `errorStatements`                                |
| Console Output              | `#d19a66` (orange) / `#abb2bf` (gray) | No   | No      | `warnStatements`, `logStatements`                             |
| Render Control              | `#98c379` (green)             | No   | No      | `reconciled`, `skipped`                                       |
| Developer Warnings          | `#d19a66` (orange)            | No   | No      | `identicalStateValueWarning`, `identicalPropValueWarning`     |
| Runtime Control             | `#d19a66` (orange)            | No   | No      | `runtimeControl`                                              |

### Notes on One Dark Pro Choices

- **Function lifecycle** (blue, bold): Cohesive pair for enter/exit, allows italic variation
- **Async lifecycle** (purple, bold): Distinct from sync functions, cohesive start/complete pair
- **Component render** (blue, bold): Same hue as functions but distinguished by context
- **State changes** (yellow): Warm, attention-drawing for mutations
- **Prop changes** (purple): External data, same family as async
- **Parameters** (gray, italic): Subdued, detailed information
- **Return** (cyan): Cool, output indication
- **Errors/Exceptions** (red + bg): Maximum visibility for problems
- **Warnings** (orange): Noticeable but less severe than errors
- **Logs** (gray): Neutral, informational
- **Render control** (green): Calming, optimization indication
- **Developer warnings** (orange): Same as console warnings
- **Runtime control** (orange): System-level, neutral

---

## Advanced: Light Theme Considerations

When creating light mode themes, invert the principles:

1. **Backgrounds:** Use light red/pink for errors instead of dark red
2. **Contrast:** Ensure all colors meet WCAG contrast requirements against white/light backgrounds
3. **Subdued colors:** Use darker grays instead of lighter grays
4. **Bold:** Same rules apply - lifecycle pairs must maintain same bold setting, errors must be bold

---

## Extending This Specification

If new event types are added to Flow or React tracing:

1. Identify which semantic category the event belongs to
2. Map it to the appropriate color using the category rules
3. Update this document with the new event mapping
4. Ensure all existing themes are updated to include the new event

---

## Visual Differentiation: Flow vs React

When both Flow and React tracing are active in the same application, it's critical that users can instantly distinguish between the two types of output. This prevents confusion and improves debugging efficiency.

### Core Principle

**Semantic consistency across tracers** (errors are always red, entries are always bold) **BUT** with **visual anchors** that distinguish Flow from React at a glance.

### Differentiation Strategies

#### Strategy 1: Color Temperature Shift (Recommended)

Use **warm colors** for one tracer and **cool colors** for the other.

**Example:**

- **Flow:** Cool palette (blue entries, cyan returns, purple async)
- **React:** Warm palette (orange/gold entries, yellow state, warm purple props)

This creates instant visual separation while maintaining semantic rules within each tracer.

#### Strategy 2: Saturation/Brightness Shift

Keep the same hues but vary saturation or brightness between tracers.

**Example:**

- **Flow:** Vibrant, saturated colors (`#61afef` bright blue)
- **React:** Muted, desaturated colors (`#7ba3c4` softer blue)

Works well but requires careful testing for accessibility.

#### Strategy 3: Icon Density

Flow and React already use different icons, but you can enhance this:

**Flow characteristics:**

- Simpler icons (→, ←)
- Function-oriented language
- Linear execution flow

**React characteristics:**

- More varied icons (⚡, 🗑️, 📝, 🔗)
- Component-oriented language
- Lifecycle-based grouping

Ensure your color choices **amplify** these existing differences rather than fighting them.

### What NOT to Do

❌ **Don't use the same color for Flow entries and React entries**
Even though both are "primary entry points," if they share `#61afef` exactly, users scanning console output won't quickly distinguish function calls from component renders.

❌ **Don't violate semantic rules to force differentiation**
Errors must still be red/bold/background in BOTH tracers. Don't make React errors orange just to be different.

❌ **Don't sacrifice readability for differentiation**
If your "warm Flow palette" makes function exits unreadable, you've failed.

### Recommended Approach: Hybrid

**Keep critical semantic colors shared:**

- Errors: Same red + bold + background in both
- Unknown: Same subdued gray in both

**Differentiate primary operations:**

- Flow function lifecycle: Cool blue (`#61afef`, bold) - enter and exit paired
- Flow async lifecycle: Purple (`#c678dd`, bold) - start and complete paired
- React render: Warm blue-purple or orange (`#d19a66` or `#b48ead`, bold) - distinct from Flow functions

**Use temperature shifts for data flow:**

- Flow parameters/returns: Cyan family (`#56b6c2`, `#abb2bf`)
- React props/state: Yellow/gold family (`#e5c07b`, `#e4c07b`)

### Testing Your Differentiation

Create a test scenario that mixes Flow and React:

```typescript
function fetchData() {
  // Flow trace: functionEnter (blue, bold)
  return api.get("/data");
  // Flow trace: functionExit (blue, bold, maybe italic)
  // Flow trace: returnValue (cyan)
}

function MyComponent() {
  // React trace: definitiveRender (blue, bold)
  const [data, setData] = useState(null);
  // React trace: stateChange (yellow)

  useEffect(() => {
    // Flow trace: functionEnter (arrow function - blue, bold)
    fetchData().then(setData);
    // Flow trace: asyncStart (purple, bold)
  }, []);

  return <div>{data}</div>;
}
```

When you look at the console output:

1. Can you **instantly** tell Flow from React traces?
2. Are errors **equally visible** in both contexts?
3. Do the colors feel **cohesive** (same theme family) while being **distinct**?

If you answer "no" to any question, adjust your color choices.

### Example: One Dark Pro Differentiation Strategy

**Current One Dark Pro uses Strategy 1 (Color Temperature) + Shared Semantics:**

| Grouping              | Flow Color               | React Color                 | Differentiation                               |
| --------------------- | ------------------------ | --------------------------- | --------------------------------------------- |
| Function Lifecycle    | `#61afef` (blue, bold)   | N/A                         | Flow-specific                                 |
| Async Lifecycle       | `#c678dd` (purple, bold) | N/A                         | Flow-specific                                 |
| Component Render      | N/A                      | `#61afef` (cool blue, bold) | **⚠️ Same blue as functions - could improve** |
| Data Changes          | N/A                      | `#e5c07b` / `#c678dd`       | React-specific (yellow/purple)                |
| Parameters            | `#abb2bf` (gray, italic) | N/A                         | Flow-specific                                 |
| Returns               | `#56b6c2` (cyan)         | N/A                         | Flow-specific                                 |
| Errors/Exceptions     | `#e06c75` (red, bold+bg) | `#e06c75` (red, bold+bg)    | Same (correct)                                |
| Console Output        | N/A                      | `#d19a66` / `#abb2bf`       | React-specific (warn/log)                     |
| Render Control        | N/A                      | `#98c379` (green)           | React-specific                                |
| Developer Warnings    | N/A                      | `#d19a66` (orange)          | React-specific                                |
| Runtime Control       | `#d19a66` (orange)       | N/A                         | Flow-specific                                 |

**Potential improvement:**
Change React `definitiveRender` to `#d19a66` (warm orange, bold) to create stronger Flow vs React distinction.

### Design Worksheet

When creating a new theme, fill this out:

| Semantic Grouping   | Flow Categories             | Flow Color | React Categories                          | React Color | Notes                                        |
| ------------------- | --------------------------- | ---------- | ----------------------------------------- | ----------- | -------------------------------------------- |
| Function Lifecycle  | functionEnter, functionExit | \_\_\_\_   | N/A                                       | N/A         | **Enter/exit MUST match color+bold**         |
| Async Lifecycle     | asyncStart, asyncComplete   | \_\_\_\_   | N/A                                       | N/A         | **Start/complete MUST match color+bold**     |
| Component Render    | N/A                         | N/A        | definitiveRender                          | \_\_\_\_    | Bold, prominent                              |
| Data Changes        | N/A                         | N/A        | stateChange, propChange, etc.             | \_\_\_\_    | State vs prop different colors               |
| Parameters          | parameter                   | \_\_\_\_   | N/A                                       | N/A         | Italic, subdued                              |
| Returns             | returnValue                 | \_\_\_\_   | N/A                                       | N/A         | Distinct from inputs                         |
| Errors/Exceptions   | exception                   | \_\_\_\_   | errorStatements                           | \_\_\_\_    | **MUST be same (red+bold+bg)**               |
| Console Output      | N/A                         | N/A        | warnStatements, logStatements             | \_\_\_\_    | Warnings orange, logs gray                   |
| Render Control      | N/A                         | N/A        | reconciled, skipped                       | \_\_\_\_    | Green/calming                                |
| Developer Warnings  | N/A                         | N/A        | identicalStateValueWarning, etc.          | \_\_\_\_    | Orange, same as console warnings             |
| Runtime Control     | runtimeControl              | \_\_\_\_   | N/A                                       | N/A         | Neutral gray or orange                       |

This forces you to think about each decision explicitly.

---

## License

MIT - Same as all AutoTracer theme files
