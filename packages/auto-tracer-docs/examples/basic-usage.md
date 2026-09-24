# Basic Usage Examples

Practical examples showing common AutoTracer usage patterns for everyday development scenarios.

## ReactTracer Examples

### Example 1: Simple State Tracking

Track state changes in a basic counter component:

```typescript
// components/Counter.tsx
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Step: {step}</p>
      <button onClick={() => setCount(count + step)}>Increment</button>
      <button onClick={() => setCount(count - step)}>Decrement</button>
      <button onClick={() => setStep(step + 1)}>Increase Step</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

**Console Output:**

```
Component render cycle 1:
├─ [Counter] Mount ⚡
│   Initial state count: 0
│   Initial state step: 1

Component render cycle 2:
├─ [Counter] Rendering ⚡
│   State change count: 0 → 1

Component render cycle 3:
├─ [Counter] Rendering ⚡
│   State change count: 1 → 2

Component render cycle 4:
├─ [Counter] Rendering ⚡
│   State change step: 1 → 2
```

### Example 2: Form State Management

Track complex form state:

```typescript
// components/ContactForm.tsx
import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await submitForm(formData);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setError("Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        placeholder="Name"
      />
      <input
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
        placeholder="Email"
      />
      <textarea
        value={formData.message}
        onChange={(e) => handleChange("message", e.target.value)}
        placeholder="Message"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
```

**Console Output:**

```
Component render cycle 1:
├─ [ContactForm] Mount ⚡
│   Initial state formData: {"name":"","email":"","message":""}
│   Initial state isSubmitting: false
│   Initial state error: null

Component render cycle 2:
├─ [ContactForm] Rendering ⚡
│   State change formData: {"name":"","email":"","message":""} → {"name":"John","email":"","message":""}

Component render cycle 3:
├─ [ContactForm] Rendering ⚡
│   State change formData: {"name":"John","email":"","message":""} → {"name":"John","email":"john@example.com","message":""}
```

### Example 3: Custom Hooks

Track state in custom hooks:

```typescript
// hooks/useAsync.ts
import { useState, useEffect } from "react";

export function useAsync<T>(asyncFn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    asyncFn()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, deps);

  return { data, loading, error };
}

// components/UserProfile.tsx
import { useAsync } from "../hooks/useAsync";

export function UserProfile({ userId }: { userId: string }) {
  const {
    data: user,
    loading,
    error,
  } = useAsync(
    () => fetch(`/api/users/${userId}`).then((r) => r.json()),
    [userId]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

**Console Output:**

```
Component render cycle 1:
├─ [UserProfile] Mount ⚡
│   Initial prop userId: "123"
│   Initial state data: null
│   Initial state loading: true
│   Initial state error: null

Component render cycle 2:
├─ [UserProfile] Rendering ⚡
│   State change data: null → {"id":"123","name":"John Doe","email":"john@example.com"}
│   State change loading: true → false
```

## FlowTracer Examples

### Example 1: API Call Tracing

Trace API calls and error handling:

```typescript
// lib/api.ts
export async function fetchUser(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  return response.json();
}

export async function updateUser(userId: string, data: any) {
  const response = await fetch(`/api/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

**Console Output:**

```
→ fetchUser (async started)
param userId: "123"
returned: Promise
← fetchUser (async completed, elapsed: 142.7ms)
```

### Example 2: Business Logic Tracing

Trace calculations and data transformations:

```typescript
// lib/pricing.ts
export function calculateOrderTotal(items: OrderItem[]) {
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(items);
  const discount = applyDiscounts(subtotal, items);

  return subtotal + tax + shipping - discount;
}

function calculateSubtotal(items: OrderItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function calculateTax(amount: number) {
  return amount * 0.08;
}

function calculateShipping(items: OrderItem[]) {
  const weight = items.reduce((sum, item) => sum + item.weight, 0);
  if (weight < 5) return 5.99;
  if (weight < 20) return 9.99;
  return 14.99;
}

function applyDiscounts(subtotal: number, items: OrderItem[]) {
  let discount = 0;
  if (subtotal > 100) discount += 10;
  if (items.length > 5) discount += 5;
  return discount;
}
```

**Console Output:**

```
→ calculateOrderTotal
param items: [{"price":29.99,"quantity":2,"weight":1.5},{"price":49.99,"quantity":1,"weight":3.2}]
  → calculateSubtotal
  param items: [{...}]
  returned: 109.97
  ← calculateSubtotal (elapsed: 0.3ms)
  → calculateTax
  param amount: 109.97
  returned: 8.8
  ← calculateTax (elapsed: 0.1ms)
  → calculateShipping
  param items: [{...}]
  returned: 5.99
  ← calculateShipping (elapsed: 0.2ms)
  → applyDiscounts
  param subtotal: 109.97
  param items: [{...}]
  returned: 10
  ← applyDiscounts (elapsed: 0.1ms)
returned: 114.76
← calculateOrderTotal (elapsed: 1.8ms)
```

### Example 3: Event Handler Tracing

Trace user interactions:

```typescript
// components/SearchBar.tsx
import { useState } from "react";
import { debounce } from "../lib/utils";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const data = await fetchSearchResults(searchQuery);
    setResults(data);
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={handleChange}
        placeholder="Search..."
      />
      <ul>
        {results.map((result) => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}

async function fetchSearchResults(query: string) {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  return response.json();
}
```

**Console Output:**

> **Note:** Synchronous functions use nested console groups (shown here with indentation). Async functions use flat output because async operations don't nest cleanly.

```
→ handleChange
param e: [InputEvent]
returned: undefined
← handleChange (elapsed: 0.5ms)
→ handleSearch (async started)
param searchQuery: "react"
← handleSearch (async completed, elapsed: 1.2ms)
→ fetchSearchResults (async started)
param query: "react"
returned: Promise
← fetchSearchResults (async completed, elapsed: 87.3ms)
```

## Combined ReactTracer + FlowTracer

### Example: Complete Feature Tracing

Trace both component lifecycle and business logic:

```typescript
// features/todo/TodoList.tsx
import { useState, useEffect } from "react";
import { fetchTodos, addTodo, toggleTodo, deleteTodo } from "./todoService";

export function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    setLoading(true);
    try {
      const data = await fetchTodos();
      setTodos(data);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newTodo.trim()) return;

    const todo = await addTodo(newTodo);
    setTodos([...todos, todo]);
    setNewTodo("");
  };

  const handleToggle = async (id: string) => {
    await toggleTodo(id);
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDelete = async (id: string) => {
    await deleteTodo(id);
    setTodos(todos.filter((t) => t.id !== id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <input
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="New todo"
      />
      <button onClick={handleAdd}>Add</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
            />
            {todo.title}
            <button onClick={() => handleDelete(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// features/todo/todoService.ts
export async function fetchTodos() {
  const response = await fetch("/api/todos");
  return response.json();
}

export async function addTodo(title: string) {
  const response = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, completed: false }),
  });
  return response.json();
}

export async function toggleTodo(id: string) {
  const response = await fetch(`/api/todos/${id}/toggle`, {
    method: "PATCH",
  });
  return response.json();
}

export async function deleteTodo(id: string) {
  await fetch(`/api/todos/${id}`, { method: "DELETE" });
}
```

**Console Output (Combined):**

```
// ReactTracer
Component render cycle 1:
├─ [TodoList] Mount ⚡
│   Initial state todos: []
│   Initial state newTodo: ""
│   Initial state loading: true

// FlowTracer
→ loadTodos (async started)
→ fetchTodos (async started)
returned: Promise
← fetchTodos (async completed, elapsed: 123.4ms)
← loadTodos (async completed, elapsed: 125.1ms)

// ReactTracer
Component render cycle 2:
├─ [TodoList] Rendering ⚡
│   State change todos: [] → [{"id":"1","title":"Learn React","completed":false},...]
│   State change loading: true → false

// FlowTracer
→ handleAdd (async started)
→ addTodo (async started)
param title: "Learn AutoTracer"
returned: Promise
← addTodo (async completed, elapsed: 98.7ms)
← handleAdd (async completed, elapsed: 100.3ms)

// ReactTracer
Component render cycle 3:
├─ [TodoList] Rendering ⚡
│   State change todos: [{"id":"1","title":"Learn React","completed":false}] → [{"id":"1","title":"Learn React","completed":false},{"id":"2","title":"Learn AutoTracer","completed":false}]
│   State change newTodo: "Learn AutoTracer" → ""
```

## Next Steps

- [Islands Architecture](/examples/islands) - Component isolation patterns
- [Microfrontends](/examples/microfrontends) - Multi-app integration
- [Custom Filtering](/examples/custom-filtering) - Advanced filtering techniques
- [Advanced Patterns](/examples/advanced-patterns) - Complex scenarios
