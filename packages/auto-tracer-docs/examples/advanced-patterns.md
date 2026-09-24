# Advanced Patterns

Complex React patterns and scenarios with AutoTracer.

## Overview

This guide covers advanced React patterns:

- **Higher-Order Components (HOCs)**
- **Render Props**
- **Context API**
- **Portals**
- **Suspense and Error Boundaries**
- **Custom Hooks**
- **Compound Components**
- **Controlled vs Uncontrolled Components**

## Higher-Order Components (HOCs)

### Basic HOC Tracing

```typescript
import { ComponentType } from 'react';

// HOC definition
function withAuth<P extends object>(Component: ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      checkAuth().then((authenticated) => {
        setIsAuthenticated(authenticated);
        setLoading(false);
      });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!isAuthenticated) return <div>Access Denied</div>;

    return <Component {...props} />;
  };
}

// Usage
// @trace
const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
};

export const ProtectedUserProfile = withAuth(UserProfile);
```

**Console Output:**

```
Component render cycle 1:
├─ [WithAuthComponent] Mount ⚡
│   Initial state isAuthenticated: false
│   Initial state loading: true

Component render cycle 2:
├─ [WithAuthComponent] Rendering ⚡
│   State change isAuthenticated: false → true
│   State change loading: true → false

Component render cycle 3:
├─ [UserProfile] Mount ⚡
│   Initial prop userId: "123"
│   Initial state user: null

Component render cycle 4:
├─ [UserProfile] Rendering ⚡
│   State change user: null → {"id":"123","name":"Alice"}
```

### HOC with Additional Props

```typescript
function withAnalytics<P extends object>(
  Component: ComponentType<P>,
  eventName: string
) {
  return function WithAnalyticsComponent(props: P) {
    const [interactions, setInteractions] = useState(0);

    const trackInteraction = () => {
      setInteractions((count) => count + 1);
      analytics.track(eventName, { count: interactions + 1 });
    };

    return <Component {...props} onInteraction={trackInteraction} />;
  };
}

// @trace
const Button = ({
  label,
  onInteraction,
}: {
  label: string;
  onInteraction?: () => void;
}) => {
  return <button onClick={onInteraction}>{label}</button>;
};

export const TrackedButton = withAnalytics(Button, 'button_click');
```

**Console Output:**

```
Component render cycle 1:
├─ [WithAnalyticsComponent] Mount ⚡
│   Initial state interactions: 0

Component render cycle 2:
├─ [Button] Mount ⚡
│   Initial prop label: "Click Me"
│   Initial prop onInteraction: function

// User clicks button
Component render cycle 3:
├─ [WithAnalyticsComponent] Rendering ⚡
│   State change interactions: 0 → 1

Component render cycle 4:
├─ [Button] Rendering ⚡
```

## Render Props

### Basic Render Prop Pattern

```typescript
// @trace
function MouseTracker({ render }: { render: (position: Position) => JSX.Element }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return render(position);
}

// Usage
export function App() {
  return (
    <MouseTracker
      render={(position) => (
        <div>
          Mouse position: {position.x}, {position.y}
        </div>
      )}
    />
  );
}
```

**Console Output:**

```
Component render cycle 1:
├─ [MouseTracker] Mount ⚡
│   Initial prop render: function
│   Initial state position: {"x":0,"y":0}

Component render cycle 2:
├─ [MouseTracker] Rendering ⚡
│   State change position: {"x":0,"y":0} → {"x":150,"y":200}

Component render cycle 3:
├─ [MouseTracker] Rendering ⚡
│   State change position: {"x":150,"y":200} → {"x":151,"y":201}
```

### Data Fetching with Render Props

```typescript
type DataLoaderProps<T> = {
  url: string;
  render: (data: T | null, loading: boolean, error: Error | null) => JSX.Element;
};

// @trace
function DataLoader<T>({ url, render }: DataLoaderProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then((r) => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return render(data, loading, error);
}

// Usage
export function UserProfile({ userId }: { userId: string }) {
  return (
    <DataLoader<User>
      url={`/api/users/${userId}`}
      render={(user, loading, error) => {
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error: {error.message}</div>;
        return <div>{user?.name}</div>;
      }}
    />
  );
}
```

**Console Output:**

```
Component render cycle 1:
├─ [DataLoader] Mount ⚡
│   Initial prop url: "/api/users/123"
│   Initial prop render: function
│   Initial state data: null
│   Initial state loading: true
│   Initial state error: null

Component render cycle 2:
├─ [DataLoader] Rendering ⚡
│   State change data: null → {"id":"123","name":"Alice"}
│   State change loading: true → false
```

## Context API

### Context with Tracing

```typescript
import { createContext, useContext, useState } from 'react';

type Theme = 'light' | 'dark';
type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// @trace
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// @trace
export function ThemedButton() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('ThemedButton must be used within ThemeProvider');
  }

  const { theme, toggleTheme } = context;

  return (
    <button onClick={toggleTheme} className={theme}>
      Current theme: {theme}
    </button>
  );
}
```

**Console Output:**

```
Component render cycle 1:
├─ [ThemeProvider] Mount ⚡
│   Initial state theme: "light"

Component render cycle 2:
├─ [ThemedButton] Mount ⚡
│   (reads context: theme "light")

// User clicks button
Component render cycle 3:
├─ [ThemeProvider] Rendering ⚡
│   State change theme: "light" → "dark"

Component render cycle 4:
├─ [ThemedButton] Rendering ⚡
│   (reads context: theme "dark")
```

### Multi-Level Context

```typescript
type User = { id: string; name: string };
type AuthContextValue = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// @trace
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (user: User) => setUser(user);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// @trace
export function UserBadge() {
  const auth = useContext(AuthContext);
  const theme = useContext(ThemeContext);

  return (
    <div className={theme?.theme}>
      {auth?.user ? `Welcome, ${auth.user.name}` : 'Guest'}
    </div>
  );
}
```

**Console Output:**

```
Component render cycle 1:
├─ [AuthProvider] Mount ⚡
│   Initial state user: null

Component render cycle 2:
├─ [ThemeProvider] Mount ⚡
│   Initial state theme: "light"

Component render cycle 3:
├─ [UserBadge] Mount ⚡
│   (reads context: user null, theme "light")

// User logs in
Component render cycle 4:
├─ [AuthProvider] Rendering ⚡
│   State change user: null → {"id":"123","name":"Alice"}

Component render cycle 5:
├─ [UserBadge] Rendering ⚡
│   (reads context: user {"id":"123","name":"Alice"}, theme "light")
```

## Portals

### Basic Portal Tracing

```typescript
import { useState } from 'react';
import { createPortal } from 'react-dom';

// @trace
export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.getElementById('modal-root')!
  );
}

// @trace
export function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>Open Modal</button>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Modal Content</h2>
        <p>This is rendered in a portal!</p>
      </Modal>
    </div>
  );
}
```

**Console Output:**

```
Component render cycle 1:
├─ [App] Mount ⚡
│   Initial state isModalOpen: false

// User clicks "Open Modal"
Component render cycle 2:
├─ [App] Rendering ⚡
│   State change isModalOpen: false → true

Component render cycle 3:
├─ [Modal] Mount ⚡
│   Initial prop isOpen: true
│   Initial prop onClose: function

// User closes modal
Component render cycle 4:
├─ [App] Rendering ⚡
│   State change isModalOpen: true → false

Component render cycle 5:
├─ [Modal] Unmount
```

### Nested Portals

```typescript
// @trace
export function Tooltip({ text, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <>
      <div
        onMouseEnter={(e) => {
          setPosition({ x: e.clientX, y: e.clientY });
          setIsVisible(true);
        }}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible &&
        createPortal(
          <div
            className="tooltip"
            style={{ left: position.x, top: position.y }}
          >
            {text}
          </div>,
          document.getElementById('tooltip-root')!
        )}
    </>
  );
}
```

**Console Output:**

```
Component render cycle 1:
├─ [Tooltip] Mount ⚡
│   Initial prop text: "Helpful hint"
│   Initial state isVisible: false
│   Initial state position: {"x":0,"y":0}

// Mouse enters
Component render cycle 2:
├─ [Tooltip] Rendering ⚡
│   State change isVisible: false → true
│   State change position: {"x":0,"y":0} → {"x":150,"y":200}

// Mouse leaves
Component render cycle 3:
├─ [Tooltip] Rendering ⚡
│   State change isVisible: true → false
```

## Suspense and Error Boundaries

### Suspense with Tracing

```typescript
import { Suspense, lazy } from 'react';

const LazyComponent = lazy(() => import('./HeavyComponent'));

// @trace
export function App() {
  const [showLazy, setShowLazy] = useState(false);

  return (
    <div>
      <button onClick={() => setShowLazy(true)}>Load Component</button>
      {showLazy && (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyComponent />
        </Suspense>
      )}
    </div>
  );
}

// @trace (in HeavyComponent.tsx)
export function HeavyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, []);

  return <div>{data}</div>;
}
```

**Console Output:**

```
Component mount: App
  State: showLazy = false

// User clicks button
Component update: App
  State: showLazy = true (changed from false)

// Suspense fallback shows while loading

// After component loads
Component mount: HeavyComponent
  State: data = null

Component update: HeavyComponent
  State: data = {...} (changed from null)
```

### Error Boundary

```typescript
import { Component, ErrorInfo } from 'react';

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

// Note: Error Boundaries must be class components
export class ErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Error: {this.state.error?.message}</div>;
    }

    return this.props.children;
  }
}

// @trace
function BuggyComponent() {
  const [count, setCount] = useState(0);

  if (count > 5) {
    throw new Error('Count too high!');
  }

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

export function App() {
  return (
    <ErrorBoundary>
      <BuggyComponent />
    </ErrorBoundary>
  );
}
```

**Console Output:**

```
Component render cycle 1:
├─ [BuggyComponent] Mount ⚡
│   Initial state count: 0

Component render cycle 2:
├─ [BuggyComponent] Rendering ⚡
│   State change count: 0 → 1

// ...continues...

Component render cycle 7:
├─ [BuggyComponent] Rendering ⚡
│   State change count: 5 → 6

// Error thrown!
ErrorBoundary caught: Error: Count too high!

Component render cycle 8:
├─ [BuggyComponent] Unmount
```

## Custom Hooks

### Stateful Custom Hook

```typescript
// @trace
export function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}

// @trace
export function CounterComponent() {
  const counter = useCounter(10);

  return (
    <div>
      <p>Count: {counter.count}</p>
      <button onClick={counter.increment}>+</button>
      <button onClick={counter.decrement}>-</button>
      <button onClick={counter.reset}>Reset</button>
    </div>
  );
}
```

**Console Output:**

```
Component render cycle 1:
├─ [CounterComponent] Mount ⚡
│   Initial state count: 10 (from useCounter)

Component render cycle 2:
├─ [CounterComponent] Rendering ⚡
│   State change count: 10 → 11

Component render cycle 3:
├─ [CounterComponent] Rendering ⚡
│   State change count: 11 → 12
```

### Async Custom Hook

```typescript
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then((r) => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

// @trace
export function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error } = useFetch<User>(`/api/users/${userId}`);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{user?.name}</div>;
}
```

**Console Output:**

```
Component render cycle 1:
├─ [UserProfile] Mount ⚡
│   Initial prop userId: "123"
│   Initial state data: null (from useFetch)
│   Initial state loading: true (from useFetch)
│   Initial state error: null (from useFetch)

Component render cycle 2:
├─ [UserProfile] Rendering ⚡
│   State change data: null → {"id":"123","name":"Alice"}
│   State change loading: true → false
```

## Compound Components

### Parent-Child Communication

```typescript
type TabsContextValue = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

// @trace
export function Tabs({ children, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

// @trace
export function TabList({ children }: { children: React.ReactNode }) {
  return <div className="tab-list">{children}</div>;
}

// @trace
export function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const context = useContext(TabsContext);
  const isActive = context?.activeTab === id;

  return (
    <button
      className={isActive ? 'tab active' : 'tab'}
      onClick={() => context?.setActiveTab(id)}
    >
      {children}
    </button>
  );
}

// @trace
export function TabPanel({ id, children }: { id: string; children: React.ReactNode }) {
  const context = useContext(TabsContext);
  const isActive = context?.activeTab === id;

  if (!isActive) return null;

  return <div className="tab-panel">{children}</div>;
}

// Usage
export function App() {
  return (
    <Tabs defaultTab="tab1">
      <TabList>
        <Tab id="tab1">Tab 1</Tab>
        <Tab id="tab2">Tab 2</Tab>
      </TabList>
      <TabPanel id="tab1">Content 1</TabPanel>
      <TabPanel id="tab2">Content 2</TabPanel>
    </Tabs>
  );
}
```

**Console Output:**

```
Component render cycle 1:
├─ [Tabs] Mount ⚡
│   Initial state activeTab: "tab1"

Component render cycle 2:
├─ [TabList] Mount ⚡

Component render cycle 3:
├─ [Tab] Mount ⚡
│   Initial prop id: "tab1"
│   (reads context: activeTab "tab1", isActive true)

Component render cycle 4:
├─ [Tab] Mount ⚡
│   Initial prop id: "tab2"
│   (reads context: activeTab "tab1", isActive false)

Component render cycle 5:
├─ [TabPanel] Mount ⚡
│   Initial prop id: "tab1"
│   (reads context: activeTab "tab1", isActive true)

// User clicks "Tab 2"
Component render cycle 6:
├─ [Tabs] Rendering ⚡
│   State change activeTab: "tab1" → "tab2"

Component render cycle 7:
├─ [Tab] Rendering ⚡
│   (id "tab1", reads context: activeTab "tab2", isActive false)

Component render cycle 8:
├─ [Tab] Rendering ⚡
│   (id "tab2", reads context: activeTab "tab2", isActive true)

Component render cycle 9:
├─ [TabPanel] Unmount
│   (id "tab1")

Component render cycle 10:
├─ [TabPanel] Mount ⚡
│   Initial prop id: "tab2"
│   (reads context: activeTab "tab2", isActive true)
```

## Controlled vs Uncontrolled Components

### Controlled Component

```typescript
// @trace
export function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

**Console Output:**

```
Component render cycle 1:
├─ [ControlledInput] Mount ⚡
│   Initial state value: ""

Component render cycle 2:
├─ [ControlledInput] Rendering ⚡
│   State change value: "" → "h"

Component render cycle 3:
├─ [ControlledInput] Rendering ⚡
│   State change value: "h" → "he"

Component render cycle 4:
├─ [ControlledInput] Rendering ⚡
│   State change value: "he" → "hel"
```

### Uncontrolled Component

```typescript
// @trace
export function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    console.log('Value:', inputRef.current?.value);
  };

  return (
    <div>
      <input ref={inputRef} defaultValue="" />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

**Console Output:**

```
Component render cycle 1:
├─ [UncontrolledInput] Mount ⚡
│   Initial ref inputRef: <input>

// No updates as user types

// Only when button clicked
Value: hello
```

## Next Steps

- [Basic Usage](/examples/basic-usage) - Simple examples
- [Islands Architecture](/examples/islands) - Component isolation
- [Microfrontends](/examples/microfrontends) - Multi-app integration
- [Custom Filtering](/examples/custom-filtering) - Advanced filtering
- [API Reference](/api/react18) - Full API documentation
