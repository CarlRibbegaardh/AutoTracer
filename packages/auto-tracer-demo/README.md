# @autotracer/demo

**Task management demo for inspecting React renders, function execution, and browser network activity with AutoTracer.**

## Overview

This interactive React 18 application demonstrates ReactTracer, FlowTracer, and NetworkTracer through task management, render experiments, and a live Open-Meteo weather station. It is built with Material UI, RTK Query, React Router, and MSW.

The start page at `/` introduces the available tracers and provides pointer and keyboard access to the AutoTracer dashboard. Task statistics remain available at `/dashboard`.

## Why Use It

The demo provides a working application where the same user action can produce component, function, and network traces. You can:

- Control React18, Flow, and Network tracing independently from the Dashboard
- Watch component re-renders in real-time as you interact with the UI
- See function execution traces for business logic
- Trace RTK Query requests handled by the local MSW worker
- Trace cross-origin place searches and weather updates sent to Open-Meteo
- Compare DevTools and copy-paste output through the shared output control

This public demo is an intentional exception to the normal deployment guidance: its production build includes ReactTracer, FlowTracer, and NetworkTracer so visitors can try the complete system. Applications using AutoTracer should still restrict tracing to local development or internal test environments.

---

## Features

### Task Management

- ✅ Dashboard with statistics and charts (recharts)
- ✅ Task list with filtering by status and priority
- ✅ CRUD operations with optimistic UI updates
- ✅ Persistent data via MSW (Mock Service Worker)
- ✅ Trace Lab page for inspecting mirrored local draft state transitions

### Weather Station

- ✅ Debounced place search through the Open-Meteo geocoding API
- ✅ Explicit weather updates for the selected location
- ✅ Today tab with current conditions and a 24-hour forecast
- ✅ Forecast tab with seven daily summaries
- ✅ Loading, refresh, empty, and request-error states

### AutoTracer Integration

- ✅ Dashboard and lower-level console controls for React18, Flow, and Network tracing
- ✅ ReactTracer: Component render tracking with prop/state change detection
- ✅ Flow: Function execution tracing for business logic
- ✅ NetworkTracer: Fetch lifecycle tracing for RTK Query and direct browser requests
- ✅ Automatic instrumentation via Vite plugins
- ✅ Visual feedback in browser console with color-coded output

### Tech Stack

- React 18 + TypeScript (strictest settings)
- Material-UI (MUI) for components
- Redux Toolkit + RTK Query for state management
- React Router for navigation
- Reselect for memoized selectors
- MSW for API mocking
- Recharts for data visualization
- date-fns for date handling

---

## Installation

```bash
# From repository root
pnpm install

# Run demo
pnpm --filter @autotracer/demo dev

# Open http://localhost:5190
```

---

## Usage

### Running the Demo

1. **Start the dev server:**

   ```bash
   pnpm --filter @autotracer/demo dev
   ```

2. **Open the application:**
   Navigate to `http://localhost:5190`

3. **Use the AutoTracer dashboard widget:**
  Open the start page and select **Toggle dashboard**, or press `Alt+Shift+D` from any page. The React, Flow, and Network tabs are the normal control surface for tracing.

4. **Optional: use the lower-level console API instead:**

   ```javascript
  globalThis.startAllTracing();
   ```

5. **Interact with the app:**
   - Navigate between pages (watch React18 component traces)
   - Open Trace Lab to inspect mirrored local state, blank-state toggles, and remount tokens
   - Filter tasks (watch React18 state changes)
   - Toggle theme (watch React18 re-renders)
   - Any business logic execution will show Flow traces
  - Load, create, update, or delete tasks to produce NetworkTracer request pairs
  - Search for a place and update the Weather Station to trace live cross-origin requests

### Lower-Level Console API

The demo mounts the AutoTracer dashboard widget, which is the normal control surface in the browser. The global API remains useful for tests, automation, and other non-Dashboard setups:

#### Unified Controls

```javascript
// Start or stop every tracer available in this build
globalThis.startAllTracing();
globalThis.stopAllTracing();

// Select one shared output format
globalThis.autoTracer.setOutputMode("devtools");
globalThis.autoTracer.setOutputMode("copy-paste");
```

#### React18 Component Tracing

```javascript
// Start React18 tracing
globalThis.autoTracer.reactTracer.start();

// Stop React18 tracing
globalThis.autoTracer.reactTracer.stop();

// Check if React18 tracing is enabled
globalThis.autoTracer.reactTracer.isEnabled();
// → true or false

```

#### Flow Function Tracing

```javascript
// Start Flow tracing
globalThis.autoTracer.flowTracer.start();

// Stop Flow tracing
globalThis.autoTracer.flowTracer.stop();

// Check if Flow tracing is enabled
globalThis.autoTracer.flowTracer.isEnabled();
// → true or false
```

#### Network Tracing

NetworkTracer is available in both development and production builds of this demo.

```javascript
globalThis.autoTracer.networkTracer.start();
globalThis.autoTracer.networkTracer.stop();
globalThis.autoTracer.networkTracer.isEnabled();
// → true or false
```

Use the Dashboard Network tab to configure header and body capture, URL filters, redaction, automatic stopping, and pending-request draining.

---

### Example Console Output

#### React18 Tracing

When you interact with the app, you'll see component render traces:

```
✅ TasksPage rendered (definitiveRender)
  └─ 📦 props: { location, params }
  └─ 🔧 state: { filterStatus: 'all', filterPriority: 'all' }

✅ TaskList rendered (propChange)
  └─ 📦 props.tasks changed: [3 tasks] → [5 tasks]
```

#### Flow Tracing

Function executions appear with entry/exit logs and timing:

```
→ calculateTaskStats(tasks: Task[])
  ├─ Parameter: tasks = [5 items]
← calculateTaskStats returned: { total: 5, completed: 2, pending: 3 }
  └─ Duration: 1.2ms
```

#### Network Tracing

Loading the task list produces a correlated Fetch pair:

```text
Network #1 -> GET /api/tasks
Network #1 <- 200 GET /api/tasks (302 ms)
```

The Weather Station produces separate geocoding and forecast pairs. Query parameters remain visible in the traced URL, subject to the active NetworkTracer redaction settings.

---

## Configuration

### Build Configuration

The Vite configuration applies the React, Flow, and Network plugins. All three remain enabled in production because this site exists specifically for visitors to try AutoTracer:

```typescript
// vite.config.ts
import { flowTracer } from "@autotracer/plugin-vite-flow";
import { networkTracer } from "@autotracer/plugin-vite-network";
import { reactTracer } from "@autotracer/plugin-vite-react18";

export default defineConfig(({ command, mode }) => ({
  plugins: [
    reactTracer.vite({
      inject: true,
      dashboardConfig: {},
    }),
    flowTracer({
      inject: true,
      runtimeControlled: true,
      include: { paths: ["**/src/**"] },
      dashboardConfig: {},
    }),
    networkTracer.vite({
      inject: true,
      dashboardConfig: {},
    }),
    react(),
  ],
}));
```

`TRACE_INJECT=0` remains available as an emergency exclusion for NetworkTracer. The normal production command builds the complete public demo:

```bash
pnpm --filter @autotracer/demo build
```

ReactTracer is initialized in `main.tsx` before React renders. FlowTracer and NetworkTracer are bootstrapped by their Vite plugins and start dormant.

---

## Architecture

```mermaid
graph TD
    A[main.tsx] -->|Initialize| B[ReactTracer]
  N[Network Vite plugin] -->|Install before app entry| O[NetworkTracer]
    A -->|Start| C[MSW Worker]
    A -->|Render| D[App]
    D --> E[Redux Provider]
    E --> F[Theme Provider]
    F --> G[Router]
    G --> H[AppLayout]
    H --> I[Dashboard]
    H --> J[Tasks]
    H --> K[Settings]
    H --> P[Weather Station]

    L[RTK Query] -->|Fetch| C
    L -->|Cross-origin Fetch| Q[Open-Meteo]
    L -->|Cache| E
    O -->|Observe Fetch lifecycle| L

    B -->|Instrument| I
    B -->|Instrument| J
    B -->|Instrument| K

    M[Dashboard or global API] -->|Control| B
    M -->|Control| O
  ```

### Data Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Redux
    participant RTK
    participant NetworkTracer
    participant MSW
    participant Console

    User->>UI: Interact (e.g., filter tasks)
    UI->>Redux: Dispatch action
    Redux->>RTK: Trigger query
    RTK->>NetworkTracer: Fetch request
    NetworkTracer-->>Console: Request start
    RTK->>MSW: HTTP Request
    MSW-->>RTK: Mock Response (300ms delay)
    NetworkTracer-->>Console: Request completion
    RTK-->>Redux: Update cache
    Redux-->>UI: Re-render components
    UI-->>Console: ReactTracer logs render details
    UI-->>User: Updated view
```

---

## Running in Production

### Build for Production

```bash
# Build optimized bundle
pnpm --filter @autotracer/demo build

# Preview production build
pnpm --filter @autotracer/demo preview
```

### Deploy to Azure Static Web Apps

1. **Build the application:**

   ```bash
   pnpm --filter @autotracer/demo build
   ```

2. **Configure Azure Static Web Apps:**
   - Output folder: `packages/auto-tracer-demo/dist`
   - Build command: `pnpm --filter @autotracer/demo build`
   - App location: `/`

3. **Keep the checked-in SPA fallback:**

   `public/staticwebapp.config.json` is copied into the build output by Vite:

   ```json
   {
     "navigationFallback": {
       "rewrite": "/index.html"
     }
   }
   ```

   Azure Static Web Apps uses this fallback for direct requests and reloads on routes such as `/tasks`, `/weather`, and `/dashboard`.

4. **Deploy via Azure Portal or GitHub Actions:**
   - Connect your repository
   - Configure build settings
   - Deploy automatically on push

### Environment Variables

No environment variable is required for development or production builds. `TRACE_INJECT=0` disables NetworkTracer injection when an emergency exclusion is required.

---

## Testing

### E2E Tests

```bash
# Run Playwright tests
pnpm --filter @autotracer/demo test:e2e

# Run in UI mode
pnpm --filter @autotracer/demo test:e2e:ui

# Debug tests
pnpm --filter @autotracer/demo test:e2e:debug
```

### Test Coverage

E2E tests cover:

- ✅ Navigation between routes
- ✅ Theme switching
- ✅ Task filtering and CRUD operations
- ✅ ReactTracer console output verification
- ✅ NetworkTracer availability, unified controls, and task-request lifecycle output
- ✅ Weather Station route, search control, update state, and empty state
- ✅ Start-page dashboard controls, tracer descriptions, and documentation link
- ✅ Subpage reload behavior and deployed navigation fallback configuration

The Weather Station E2E scenario is a smoke test and does not call Open-Meteo. Running the development server uses live Open-Meteo data.

---

## Project Structure

The application uses **enterprise-level feature-based organization** with concerns grouped by feature and technical responsibility:

```
packages/auto-tracer-demo/
├── src/
│   ├── features/              # Feature-based modules (enterprise pattern)
│   │   ├── start/            # Dashboard access and tracer overview
│   │   │   ├── components/   # Access panel and tracer descriptions
│   │   │   └── types/        # Tracer description contract
│   │   ├── dashboard/        # Dashboard feature (statistics, charts)
│   │   │   ├── components/   # StatCard, TaskStatusBarChart, etc.
│   │   │   ├── types/        # StatCardProps, BarChartDataPoint, etc.
│   │   │   └── index.ts      # Barrel export
│   │   ├── tasks/            # Task management feature
│   │   │   ├── components/   # TaskFilters, TaskTable
│   │   │   ├── types/        # TaskFiltersProps, TaskTableProps
│   │   │   ├── utils/        # Chip color utilities, filter handlers
│   │   │   └── index.ts      # Barrel export
│   │   ├── weather/          # Search, conditions, and forecast components
│   │   │   ├── components/   # Search panel, summaries, and forecast tables
│   │   │   ├── types/        # Component property contracts
│   │   │   └── utils/        # Weather labels, formatting, and request timing
│   │   ├── tracing/          # Console API reference
│   │   │   ├── components/   # ConsoleApiReference
│   │   │   └── index.ts      # Barrel export
│   │   └── shared/           # Shared layout and navigation
│   │       ├── components/   # AppLayout, AppHeader, AppSidebar
│   │       ├── types/        # NavItem, layout props
│   │       ├── utils/        # navConfig, constants (DRAWER_WIDTH)
│   │       └── index.ts      # Barrel export
│   ├── services/             # API abstraction layer
│   │   ├── taskService.ts   # useTaskService (wraps RTK Query)
│   │   └── index.ts         # Barrel export
│   ├── domain/              # Task, place, and weather response types
│   ├── store/               # Redux store, slices, API, selectors
│   │   ├── api/            # RTK Query API endpoints
│   │   ├── slices/         # Redux slices
│   │   ├── selectors/      # Reselect selectors
│   │   └── store.ts        # Store configuration
│   ├── mocks/              # MSW handlers and database
│   ├── theme/              # MUI theme configuration
│   ├── pages/              # Routed page components
│   │   ├── StartPage.tsx       # Explains dashboard use and available tracers
│   │   ├── DashboardPage.tsx   # Uses dashboard feature components
│   │   ├── TasksPage.tsx       # Uses tasks feature components
│   │   ├── WeatherStationPage.tsx # Searches places and displays weather
│   ├── App.tsx             # Root app component
│   └── main.tsx            # Entry point + ReactTracer init
├── public/                 # MSW worker + Azure SPA fallback configuration
├── tests/                  # E2E tests
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

### Feature Organization Principles

Each feature folder (`dashboard/`, `tasks/`, `tracing/`, `shared/`) follows a **consistent internal structure**:

- **`components/`** - Feature-specific UI components as separate files (one export per file)
- **`types/`** - TypeScript interfaces and types (component props, data models)
- **`utils/`** - Pure utility functions (transformations, calculations, handlers)
- **`hooks/`** - Custom React hooks (state management, side effects)
- **`services/`** - Service layer for API or external integration (tracing controls)
- **`index.ts`** - Barrel export re-exporting all public API from the feature

This structure provides:

- ✅ **Clear boundaries** - Features are self-contained and discoverable
- ✅ **Scalability** - Easy to add new features without impacting existing ones
- ✅ **Testability** - Each component/util/hook can be tested in isolation
- ✅ **Maintainability** - Changes are localized to feature folders
- ✅ **Named exports only** - No default exports (except Babel plugins)
- ✅ **File naming matches exports** - `StatCard.tsx` exports `StatCard`

---

## Code Quality and Functional Design

### No Anonymous Functions

All functions are **named and documented** with TSDoc comments, making stack traces readable and code searchable:

```typescript
// ❌ BAD: Anonymous function in event handler
<Button onClick={() => handleDelete(id)}>Delete</Button>

// ✅ GOOD: Named function with clear purpose
/**
 * Creates a task deletion handler.
 * @param taskId - ID of the task to delete
 * @param deleteTask - RTK mutation hook
 */
export function handleTaskDeletion(
  taskId: string,
  deleteTask: (id: string) => void
): () => void {
  return () => deleteTask(taskId);
}
```

### Functional Composition

Utilities are **pure functions** with clear single responsibilities:

```typescript
/**
 * Determines the MUI color for a task status chip.
 */
export function getStatusChipColor(status: TaskStatus): ChipProps["color"] {
  switch (status) {
    case "completed":
      return "success";
    case "in-progress":
      return "primary";
    case "pending":
      return "default";
  }
}
```

### Service Layer Abstraction

The **services layer** abstracts RTK Query hooks for cleaner component code:

```typescript
// src/services/taskService.ts
export function useTaskService() {
  const { data: tasks, isLoading } = useGetTasksQuery();
  const [addTask] = useAddTaskMutation();
  // ...
  return { tasks, isLoading, addTask, updateTask, deleteTask };
}

// In components - clean and readable
const { tasks, addTask, deleteTask } = useTaskService();
```

### Separation of Concerns

- **Components** render UI and delegate logic to utilities/services
- **Utils** contain pure transformation logic (no side effects)
- **Services** handle external interactions (API, tracing controls)
- **Hooks** encapsulate stateful logic (tracing state)
- **Types** define contracts (props, data models)

---

## Key Concepts Demonstrated

### 1. **Reselect for Performance**

Memoized selectors prevent unnecessary re-renders:

```typescript
export const selectFilteredTasks = createSelector(
  [selectTasksResult, selectTaskFilter],
  (tasks, filter) => {
    // Expensive filtering only runs when inputs change
    return tasks?.filter(/* ... */);
  },
);
```

### 2. **RTK Query for Data Fetching**

Automatic caching, loading states, and cache invalidation:

```typescript
const { data: tasks, isLoading } = useGetTasksQuery();
const [updateTask] = useUpdateTaskMutation();
```

### 3. **MSW for Realistic API Mocking**

Intercepts network requests in the browser:

```typescript
http.get("/api/tasks", async () => {
  await delay(300); // Simulate network latency
  return HttpResponse.json(taskDb.getAllTasks());
});
```

### ReactTracer Visibility

See exactly when and why components re-render:

```
[TaskList] Rendering (PerformedWork)
  ├─ State change filteredTasks: [...] → [...]
  └─ Component is rendering
```

---

## Troubleshooting

### MSW Worker Not Loading

If you see "Service Worker registration failed", ensure:

- MSW is initialized in `public/` directory
- Service workers are supported (not in private browsing)
- Running on localhost or HTTPS

### ReactTracer Not Logging

1. If the AutoTracer dashboard widget is mounted, confirm tracing is started there
2. Otherwise check the lower-level runtime API: `globalThis.autoTracer.reactTracer.isEnabled()`
3. Otherwise enable tracing: `globalThis.autoTracer.reactTracer.start()`
4. Verify Vite plugin is configured in `vite.config.ts`

### Build Errors

Run from repository root:

```bash
pnpm build --filter @autotracer/demo
```

---

## Contributing

This is a demo package within the ReactTracer monorepo. To contribute:

1. Follow monorepo conventions
2. Maintain 100% TypeScript strictness
3. Update this README when adding features
4. Add E2E tests for new functionality

---

## License

MIT © Carl Ribbegårdh
