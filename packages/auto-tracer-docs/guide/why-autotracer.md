# Why AutoTracer?

Debugging JavaScript and React applications often involves piecing together execution flow and render behavior from partial signals. Manual logging can be repetitive, can clutter code, and can be hard to standardize across a team.

AutoTracer provides build-time instrumentation and runtime tracing that produces structured console output.

## The Problem

### Manual Logging is Repetitive

```typescript
function processOrder(order) {
  console.log("processOrder called with:", order); // Add logging

  const validated = validateOrder(order);
  console.log("validation result:", validated); // Add more logging

  if (!validated) {
    console.log("Order validation failed"); // Even more logging
    return null;
  }

  const processed = applyDiscounts(order);
  console.log("After discounts:", processed); // Still more logging

  return processed;
}
```

**Problems:**

- Code becomes cluttered
- Inconsistent logging format
- Easy to forget to remove
- No automatic variable names
- Hard to trace across async operations

### React Debugging is Complex

Understanding why a component re-rendered requires:

- Adding console.log to render methods
- Installing React DevTools
- Manually inspecting component tree
- Comparing props/state snapshots
- Guessing which prop/state caused the update

```typescript
function UserProfile({ user, settings }) {
  console.log("UserProfile render"); // Which prop changed?
  console.log("user:", user); // Manual inspection
  console.log("settings:", settings); // More manual work

  useEffect(() => {
    console.log("user changed"); // Still not clear what changed
  }, [user]);

  // ... component code
}
```

### Traditional Debuggers Have Limitations

- Breakpoints disrupt flow
- Step-through debugging is time-consuming
- Hard to see historical execution
- Difficult to share debugging sessions
- Not practical for restricted deployed debugging

## The AutoTracer Solution

### Build-time Instrumentation

```typescript
// Your code (no added logging calls)
function processOrder(order) {
  const validated = validateOrder(order);
  if (!validated) return null;
  return applyDiscounts(order);
}

// Tracing output (example):
// → processOrder
// param order: {id: 123, items: [...], total: 99.99}
//   → validateOrder
//   param order: {id: 123, items: [...], total: 99.99}
//   returned: true
//   ← validateOrder (elapsed: …ms)
//   → applyDiscounts
//   param order: {id: 123, items: [...], total: 99.99}
//   returned: {id: 123, items: [...], total: 89.99}
//   ← applyDiscounts (elapsed: …ms)
// returned: {id: 123, items: [...], total: 89.99}
// ← processOrder (elapsed: …ms)
```

### React Render Tracing

```typescript
// Your code - clean React component
function UserProfile({ user, settings }) {
  const [isEditing, setIsEditing] = useState(false);
  return <div>...</div>;
}

// Tracing output (example):
// Component render cycle 1:
// └─ [UserProfile] Mount ⚡
//     Initial prop user: {name: "Alice", age: 30}
//     Initial prop settings: {theme: "dark", notifications: true}
//     Initial state isEditing: false
//
// Component render cycle 2:
// └─ [UserProfile] Update
//     Prop change user: {name: "Alice", age: 30} → {name: "Alice", age: 31}
```

### Execution History in Logs

Compared to breakpoints, AutoTracer keeps an execution history in console output:

- See the entire call chain
- Review past executions
- Compare multiple runs
- Share traces with teammates

## Key Advantages

### 1. No Manual Logging Calls

Your source code stays clean. No manual logging statements to add, maintain, or remove.

### 2. Consistent Format

All tracing output follows a consistent, readable format. Designed to be readable and searchable.

### 3. Labeled Variables

Build-time injection resolves variable names, so you see `count: 0 → 1` instead of unnamed values.

### 4. Restricted Deployment Pattern

When disabled, tracers do not emit tracing output.
When enabled, the primary cost is usually the volume of console output and DevTools rendering.
In restricted internal test/QA deployments, enable tracing right before the action you care about, scope it narrowly, then turn it off.

### 5. Build Tool Integration

Build-time plugins inject tracing hooks so runtime usage stays small.

### 6. Restricted Test/QA Debugging

Some teams deploy tracing to restricted internal test/QA environments and enable it temporarily for debugging.

## Compared to Alternatives

### vs. console.log

| Feature          | console.log  | AutoTracer |
| ---------------- | ------------ | ---------- |
| Setup            | Manual       | Automated (via plugins) |
| Format           | Inconsistent | Structured |
| Variable names   | Manual       | Automatic  |
| Code clutter     | High         | Lower (no logging calls in app code) |
| Restricted test/QA use | Possible but risky | Possible in restricted internal environments |

### vs. React DevTools

| Feature           | React DevTools    | ReactTracer           |
| ----------------- | ----------------- | --------------------- |
| Component tree    | Visual            | Text                  |
| State changes     | Manual inspection | Automatic logging     |
| Historical view   | No                | Yes (console history) |
| Shareable         | Screenshots only  | Copy/paste text       |
| CI/CD integration | No                | Possible (console output capture) |

### vs. Traditional Debuggers

| Feature           | Debugger          | AutoTracer  |
| ----------------- | ----------------- | ----------- |
| Flow interruption | Yes (breakpoints) | No          |
| Historical view   | No                | Yes         |
| Restricted test/QA use | Difficult | Possible in restricted internal environments |
| Async tracing     | Manual            | Automatic   |
| Sharing           | Screen share only | Text output |

## Real-World Use Cases

### Debugging Restricted Test/QA Issues

Enable ReactTracer temporarily in a restricted internal test/QA environment to diagnose hard-to-reproduce bugs before public release.

### Performance Analysis

Use FlowTracer to identify slow function calls and optimize hot paths.

### Code Reviews

Share trace output to explain complex execution flows to team members.

### Documentation

Include trace output in bug reports and technical documentation.

### Learning

Understand how code works by seeing the execution flow automatically.

## Next Steps

- [Choosing Your Tracer](./choosing-your-tracer) - Decide which tracer fits your needs
- [FlowTracer Quick Start](./quickstart-flow) - Get started with function tracing
- [ReactTracer Quick Start](./quickstart-react) - Get started with component tracing
