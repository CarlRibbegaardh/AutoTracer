# Example Microfrontend Remote 1

This is **Remote 1** in a microfrontend architecture demonstration. It can run standalone or be dynamically loaded by the host application using Vite Module Federation.

## Architecture

```mermaid
graph LR
    A[Remote 1 App] -->|Exposes| B[./App component]
    A -->|Uses Shared| C[React & ReactTracer]
    D[Host App] -->|Loads| B
    D -->|Provides| C
```

## Purpose

- **Remote Microfrontend**: Independently deployable React application
- **Dual Mode**: Can run standalone (dev) or as remote (loaded by host)
- **ReactTracer Integration**: Demonstrates component-level tracing with labeled state
- **Module Federation**: Exposes `./App` component for dynamic import

## Structure

```
example-microfrontend-remote1/
├── src/
│   ├── App.tsx          # Main remote component with Counter and TodoList
│   ├── App.css          # Styling for remote components
│   ├── main.tsx         # Entry point with conditional ReactTracer init
│   └── index.css        # Global styles
├── package.json         # Dependencies including Module Federation plugin
├── vite.config.ts       # Vite config exposing App component
└── README.md            # This file
```

## Configuration

### Module Federation Setup

Exposes:
- **./App**: Main application component (`./src/App.tsx`)

Shared modules: `react`, `react-dom`

**Note**: ReactTracer is **not** shared via Module Federation. Each app has its own ReactTracer instance.

### Port

- **Remote 1**: 5191

## Usage

### Standalone Development

Run independently for development and testing:

```bash
pnpm --filter example-microfrontend-remote1 dev
```

Then open http://localhost:5191

### As Remote (Loaded by Host)

The host application loads this remote dynamically:

```bash
# Start this remote
pnpm --filter example-microfrontend-remote1 dev

# Start the host (in another terminal)
pnpm --filter example-microfrontend-host dev
```

Then open http://localhost:5190 to see the host loading this remote.

### Build

```bash
pnpm --filter example-microfrontend-remote1 build
```

## Features

### Components

#### Counter Component
- Simple counter with increment button
- Demonstrates `useReactTracer` and `labelState`
- Tracked state: `count`

#### TodoList Component
- Add/display todo items
- Input field with Enter key support
- Tracked states: `todos`, `input`

#### App Component (Exported)
- Toggle visibility of Counter and TodoList
- Tracked states: `showCounter`, `showTodos`
- Coordinates child components

### ReactTracer Integration

#### Standalone Mode
When running independently, lazy-loads its own ReactTracer:

```typescript
async function initializeStandaloneTracer(): Promise<void> {
  if (window.__REACTTRACER_INITIALIZED__ || !import.meta.env.DEV) {
    return;
  }

  const { reactTracer } = await import("@autotracer/react18");

  reactTracer();

  (window as any).__REACTTRACER_INITIALIZED__ = true;
}
```

#### Remote Mode
When loaded by host, still initializes its own ReactTracer instance (not shared via Module Federation).

#### Labeled State

All state is labeled for clear tracing:

```typescript
const logger = useReactTracer();
const [count, setCount] = useState(0);
logger.labelState(0, "count", count, "setCount", setCount);

const [todos, setTodos] = useState<string[]>([]);
logger.labelState(0, "todos", todos, "setTodos", setTodos);
```

## Code Examples

### Component with ReactTracer

```typescript
function Counter() {
  const logger = useReactTracer(); // Enable tracing for this component

  const [count, setCount] = useState(0);
  logger.labelState(0, "count", count, "setCount", setCount);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

### Exposing Component via Module Federation

```typescript
// vite.config.ts
federation({
  name: 'remote1',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App.tsx',
  },
  shared: ['react', 'react-dom', '@autotracer/react18']
})
```

## Dependencies

- **react**: ^18.3.1
- **react-dom**: ^18.3.1
- **@autotracer/react18**: workspace package
- **@originjs/vite-plugin-federation**: ^1.3.5
- **vite**: ^5.3.1

## Microfrontend Testing

This remote is part of a three-app setup to investigate ReactTracer behavior:

1. **Independent ReactTracer**: Has its own ReactTracer instance (not shared)
2. **State Isolation**: Each component's state is independently tracked
3. **Component Lifecycle**: Tracing works during mount and update
4. **Labeled State**: All state changes include meaningful labels

See [MICROFRONTEND-README.md](../MICROFRONTEND-README.md) for the complete investigation guide.

## Related Apps

- [`example-microfrontend-host`](../example-microfrontend-host/README.md)
- [`example-microfrontend-remote2`](../example-microfrontend-remote2/README.md)

## License

MIT © Carl Ribbegårdh
