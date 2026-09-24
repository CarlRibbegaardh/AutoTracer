# Flow Tracing - Basic Example

A simple demonstration of automatic function flow tracing using `@autotracer/plugin-vite-flow`.

## What This Demonstrates

This example shows how the flow tracer automatically instruments functions to track:

- **Function Entry/Exit**: See when functions are called and return
- **Call Stack Tracking**: Watch nested function calls build up the call stack
- **Exception Logging**: See errors logged before they're caught or thrown
- **Zero Configuration**: No manual instrumentation needed

## Features

### Simple Operations

Basic math functions (`add`, `subtract`, `multiply`, `divide`) demonstrating function entry/exit tracking.

### Nested Calls

Functions calling other functions (`calculateAverage` → `calculateTotal` → `add`) showing call stack visualization.

### Error Handling

Try/catch with exceptions (`divide by zero`) demonstrating automatic exception logging.

## How It Works

The `@autotracer/plugin-vite-flow` Babel plugin automatically wraps every function with:

```typescript
function add(a: number, b: number): number {
  const __flowTracer = globalThis.autoTracer.flowTracer;
  const h0 = __flowTracer.enter("add");
  try {
    return a + b;
  } catch (e) {
    __flowTracer.debug("💥 Exception in add:", e);
    throw e;
  } finally {
    __flowTracer.exit(h0);
  }
}
```

This instrumentation:

1. **Logs entry** with a unique handle
2. **Tracks the call** in the call stack
3. **Logs exceptions** if any occur
4. **Logs exit** when the function returns or throws
5. **Detects mismatches** if entry/exit are unbalanced

## Running

```bash
# Install dependencies (from repo root)
pnpm install

# Start dev server
pnpm --filter example-flow-basic dev

# Open http://localhost:5180
```

## Console Output

When you click buttons in the app, you'll see traces like:

```
→ handleAdd entered (call stack: handleAdd)
  → add entered (call stack: handleAdd > add)
  ← add exited
← handleAdd exited
```

```
→ handleNested entered (call stack: handleNested)
  → calculateAverage entered (call stack: handleNested > calculateAverage)
    → calculateTotal entered (call stack: handleNested > calculateAverage > calculateTotal)
      → add entered (call stack: handleNested > calculateAverage > calculateTotal > add)
      ← add exited
      → add entered (call stack: handleNested > calculateAverage > calculateTotal > add)
      ← add exited
      ...
    ← calculateTotal exited
    → divide entered (call stack: handleNested > calculateAverage > divide)
    ← divide exited
  ← calculateAverage exited
← handleNested exited
```

```
→ handleError entered (call stack: handleError)
  → safeDivide entered (call stack: handleError > safeDivide)
    → divide entered (call stack: handleError > safeDivide > divide)
      💥 Exception in divide: Error: Division by zero
    ← divide exited (exception thrown)
  ← safeDivide exited
← handleError exited
```

## Configuration

The flow tracer is configured in `vite.config.ts`:

```typescript
import { flowTracer } from "@autotracer/plugin-vite-flow";

export default defineConfig({
  plugins: [
    flowTracer({
      tracerName: "__flowTracer", // Injected local tracer identifier name
      logExceptions: true, // Log caught exceptions
      exceptionLogLevel: "debug", // debug | info | warn | error
    }),
    react(),
  ],
});
```

## Next Steps

See `example-flow-advanced` for more complex scenarios:

- Async/await functions
- Recursive functions
- Higher-order functions
- Generator functions
- Class methods

## License

MIT © Carl Ribbegårdh
