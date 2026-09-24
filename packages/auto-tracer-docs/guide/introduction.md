# What is AutoTracer?

AutoTracer is a set of automated tracing tools for JavaScript and React applications. It helps developers understand code execution flow and React component behavior without manual instrumentation.

Start with [Your First Trace](/guide/first-trace) to run an action and explain its function calls, state changes, and renders. Use [the agent skills](/guide/agents) to automate setup, capture, and analysis, or choose a [capture workflow](/guide/capture/) for an existing integration.

## The Ecosystem

AutoTracer consists of two complementary tracers:

### FlowTracer

Traces general JavaScript/TypeScript code execution:

- Function start and completion ("→" / "←" log lines)
- Parameter values
- Return values
- Execution flow timing

### ReactTracer

Traces React component render cycles:

- Component mount and update events
- State changes with before/after values
- Prop changes across re-renders
- Warnings for changed identical values (missing memoization)

## Key Capabilities

### 🔍 Automatic Tracing

No manual logging required. Both tracers automatically instrument your code to capture execution details.

```typescript
// Without AutoTracer
function calculateTotal(items) {
  console.log("calculateTotal called", items); // Manual logging
  const total = items.reduce((sum, item) => sum + item.price, 0);
  console.log("returning", total); // Manual logging
  return total;
}

// With FlowTracer
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
// Execution automatically traced - no manual logging needed
```

### 🏷️ Human-Readable Labels

Build-time injection resolves variable names, showing you meaningful labels.

```
// You see:
State change count: 0 → 1
```

### 🚀 No Output When Disabled

When disabled, tracers do not emit tracing output.

In large apps, the primary cost when tracing is active is usually console output volume and DevTools rendering.
Enable tracing right before the action you care about, scope it narrowly, then turn it off immediately.

### 🛠️ Framework Agnostic

Supports common JavaScript bundlers and frameworks:

- Vite
- Webpack
- Next.js (Pages Router & App Router)
- Create React App

## Who Should Use AutoTracer?

### Frontend Developers

Debug React component re-renders, understand why state changes, and identify performance bottlenecks.

### Full-Stack Developers

Trace execution flow in complex business logic, understand code paths, and debug integration issues.

### Teams

Share consistent tracing output for bug reports, code reviews, and documentation.

### Restricted Test/QA Debugging

Deploy tracing only to restricted internal test/QA environments when you need to diagnose hard-to-reproduce issues before public release.

## How It Works

### FlowTracer

1. Build-time plugin transforms your code to add tracing hooks
2. Runtime library captures function calls and returns
3. Structured output logged to console

### ReactTracer

1. Attaches to React's internal DevTools hook
2. Listens for component lifecycle events
3. Extracts state/prop changes from React Fiber tree
4. Logs structured render cycle information

## Next Steps

- [Why AutoTracer?](./why-autotracer) - Understand the problems AutoTracer solves
- [Choosing Your Tracer](./choosing-your-tracer) - Decide which tracer fits your needs
- [FlowTracer Quick Start](./quickstart-flow) - Get started with function tracing
- [ReactTracer Quick Start](./quickstart-react) - Get started with component tracing
