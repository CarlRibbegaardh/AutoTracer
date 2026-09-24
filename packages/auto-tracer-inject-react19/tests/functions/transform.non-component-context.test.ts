import { describe, it, expect } from "vitest";
import { transform } from "../../src/functions/transform/transform";
import type { TransformContext } from "../../src/interfaces/TransformContext";

/**
 * Tests for multi-layer defense against false positive component detection.
 *
 * These tests validate that the transformer correctly identifies and rejects
 * non-component patterns that might superficially resemble components:
 * - React.lazy() module loaders
 * - Promise callbacks (.then, .catch, .finally)
 * - Array method callbacks (.map, .filter, etc.)
 * - Async utility functions without JSX
 * - Other edge cases
 *
 * The goal is to ensure ONLY actual React components receive injection.
 */

const DEFAULT_CONFIG = {
  mode: "opt-out" as const,
  importSource: "@autotracer/react18",
  include: { paths: ["**/*.tsx", "**/*.ts"] },
  exclude: { paths: ["**/*.test.*", "**/*.spec.*"] },
  labelHooks: ["useState", "useReducer"],
  labelHooksPattern: "^use[A-Z]",
  serverComponents: false,
};

describe("Non-Component Context Detection", () => {
  describe("React.lazy() patterns", () => {
    it("should NOT inject into lazy() async loader callback", () => {
      const code = `
        import { lazy } from 'react';

        const LazyComponent = lazy(async () => {
          const module = await import('./MyComponent');
          return { default: module.MyComponent };
        });
      `;
      const context: TransformContext = {
        filename: "App.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // Should NOT inject into the loader function
      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
      expect(result.code).not.toContain("useReactTracer");
    });

    it("should NOT inject into lazy() sync loader callback", () => {
      const code = `
        import { lazy } from 'react';

        const LazyComponent = lazy(() => import('./MyComponent'));
      `;
      const context: TransformContext = {
        filename: "App.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
      expect(result.code).not.toContain("useReactTracer");
    });

    it("should NOT inject into React.lazy() with namespace import", () => {
      const code = `
        import React from 'react';

        const LazyComponent = React.lazy(() => import('./Component'));
      `;
      const context: TransformContext = {
        filename: "App.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
    });

    it("should NOT inject into lazy() with complex module resolution", () => {
      const code = `
        import { lazy } from 'react';

        const ComponentLoader = lazy(async () => {
          const { default: Component } = await import('./path/to/Component');
          return { default: Component };
        });
      `;
      const context: TransformContext = {
        filename: "App.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
      expect(result.code).not.toContain("useReactTracer");
    });

    it("should handle lazy() inline component definition (rare but valid)", () => {
      const code = `
        import { lazy } from 'react';

        // Unusual pattern but valid: inline component in lazy
        const InlineLazy = lazy(() => Promise.resolve({
          default: () => <div>Inline Component</div>
        }));
      `;
      const context: TransformContext = {
        filename: "App.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // The outer lazy() callback should NOT be injected
      // The inner component () => <div> might be detected if we traverse deeply enough
      // For now, conservative: no injection
      expect(result.injected).toBe(false);
    });
  });

  describe("Promise callback patterns", () => {
    it("should NOT inject into Promise.then() callback", () => {
      const code = `
        const FetchData = fetch('/api/data')
          .then((response) => response.json())
          .then((data) => data.items);
      `;
      const context: TransformContext = {
        filename: "api.ts",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
      expect(result.code).not.toContain("useReactTracer");
    });

    it("should NOT inject into Promise.catch() callback", () => {
      const code = `
        const SafeFetch = fetchData()
          .catch((error) => {
            console.error(error);
            return null;
          });
      `;
      const context: TransformContext = {
        filename: "utils.ts",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
    });

    it("should NOT inject into Promise.finally() callback", () => {
      const code = `
        const LoadData = fetchData()
          .finally(() => {
            console.log('Cleanup');
          });
      `;
      const context: TransformContext = {
        filename: "utils.ts",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
    });
  });

  describe("Array method patterns", () => {
    it("should NOT inject into array.map() callback even with JSX", () => {
      const code = `
        const ListItems = items.map((item) => <li key={item.id}>{item.name}</li>);
      `;
      const context: TransformContext = {
        filename: "List.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // Map callbacks are not components
      expect(result.injected).toBe(false);
      expect(result.code).not.toContain("useReactTracer");
    });

    it("should NOT inject into array.filter() callback", () => {
      const code = `
        const ActiveItems = items.filter((item) => item.active);
      `;
      const context: TransformContext = {
        filename: "utils.ts",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
    });

    it("should NOT inject into array.reduce() callback", () => {
      const code = `
        const Total = items.reduce((acc, item) => acc + item.value, 0);
      `;
      const context: TransformContext = {
        filename: "utils.ts",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
    });

    it("should NOT inject into array.forEach() callback", () => {
      const code = `
        items.forEach((item) => {
          console.log(item);
        });
      `;
      const context: TransformContext = {
        filename: "utils.ts",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
    });

    it("should NOT inject into PascalCase array.map() callback", () => {
      const code = `
        // Even with PascalCase name, map callbacks are not components
        const RenderItems = items.map(Item => <div key={Item.id}>{Item.name}</div>);
      `;
      const context: TransformContext = {
        filename: "List.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
    });
  });

  describe("Async utility functions", () => {
    it("should NOT inject into async PascalCase function without JSX", () => {
      const code = `
        async function FetchUserData(userId: string) {
          const response = await fetch(\`/api/users/\${userId}\`);
          return response.json();
        }
      `;
      const context: TransformContext = {
        filename: "api.ts",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // Async without JSX = data loader, not component
      expect(result.injected).toBe(false);
      expect(result.code).not.toContain("useReactTracer");
    });

    it("should NOT inject into async arrow function utility", () => {
      const code = `
        const LoadConfig = async () => {
          const config = await import('./config.json');
          return config.default;
        };
      `;
      const context: TransformContext = {
        filename: "config.ts",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
    });

    it("should NOT inject into async Server Component (hooks don't work server-side)", () => {
      const code = `
        async function ServerData({ id }: { id: string }) {
          const data = await fetch(\`/api/data/\${id}\`).then(r => r.json());
          return <div>{data.name}</div>;
        }
      `;
      const context: TransformContext = {
        filename: "ServerData.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // Async functions are Server Components - can't use hooks like useReactTracer
      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
      expect(result.code).not.toContain("useReactTracer");
    });
  });

  describe("Timing function callbacks", () => {
    it("should NOT inject into setTimeout callback", () => {
      const code = `
        const TimerId = setTimeout(() => {
          console.log('Delayed');
        }, 1000);
      `;
      const context: TransformContext = {
        filename: "utils.ts",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
    });

    it("should NOT inject into setInterval callback", () => {
      const code = `
        const IntervalId = setInterval(() => {
          updateCounter();
        }, 1000);
      `;
      const context: TransformContext = {
        filename: "utils.ts",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
    });

    it("should NOT inject into requestAnimationFrame callback", () => {
      const code = `
        const AnimationId = requestAnimationFrame(() => {
          render();
        });
      `;
      const context: TransformContext = {
        filename: "animation.ts",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
    });
  });

  describe("Event handler callbacks", () => {
    it("should NOT inject into addEventListener callback", () => {
      const code = `
        window.addEventListener('click', (event) => {
          console.log('Clicked', event);
        });
      `;
      const context: TransformContext = {
        filename: "events.ts",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
    });

    it("should NOT inject into removeEventListener callback", () => {
      const code = `
        const HandleClick = (event) => console.log(event);
        window.removeEventListener('click', HandleClick);
      `;
      const context: TransformContext = {
        filename: "events.ts",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
    });
  });

  describe("Render props and render functions", () => {
    it("should NOT inject into render prop callback", () => {
      const code = `
        function ParentComponent() {
          return <DataProvider render={(data) => <div>{data.name}</div>} />;
        }
      `;
      const context: TransformContext = {
        filename: "Parent.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // Should inject into ParentComponent but NOT the render prop callback
      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("ParentComponent");

      // Verify the render callback doesn't have useReactTracer
      const renderCallbackHasTracer = result.code.includes('render={(data) => {const __reactTracer');
      expect(renderCallbackHasTracer).toBe(false);
    });

    it("should NOT inject into children render function", () => {
      const code = `
        function App() {
          return (
            <RenderPropComponent>
              {(value) => <span>{value}</span>}
            </RenderPropComponent>
          );
        }
      `;
      const context: TransformContext = {
        filename: "App.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // Should inject into App but NOT the children function
      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("App");

      // Verify children callback doesn't have useReactTracer
      const childrenCallbackHasTracer = result.code.includes('{(value) => {const __reactTracer');
      expect(childrenCallbackHasTracer).toBe(false);
    });

    it("should NOT inject into renderItem callback", () => {
      const code = `
        function ListComponent({ items }) {
          return <VirtualList renderItem={(item) => <div>{item.name}</div>} items={items} />;
        }
      `;
      const context: TransformContext = {
        filename: "List.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // Should inject into ListComponent but NOT renderItem callback
      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("ListComponent");

      // Verify renderItem callback doesn't have useReactTracer
      const renderItemHasTracer = result.code.includes('renderItem={(item) => {const __reactTracer');
      expect(renderItemHasTracer).toBe(false);
    });

    it("should NOT inject into inline event handlers with JSX", () => {
      const code = `
        function ButtonComponent() {
          return <button onClick={() => <Modal />}>Open</button>;
        }
      `;
      const context: TransformContext = {
        filename: "Button.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // Should inject into ButtonComponent but NOT the onClick callback
      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("ButtonComponent");

      // Verify onClick callback doesn't have useReactTracer
      const onClickHasTracer = result.code.includes('onClick={() => {const __reactTracer');
      expect(onClickHasTracer).toBe(false);
    });
  });

  describe("Render helper functions - camelCase", () => {
    it("should NOT detect camelCase render helpers even if they call hooks", () => {
      const code = `
        function renderHello() {
          const [count, setCount] = useState(0);
          return <div>{count}</div>;
        }

        function Component() {
          return renderHello();
        }
      `;
      const context: TransformContext = {
        filename: "Component.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // Strict PascalCase policy: camelCase functions are NOT components
      // Even if they call hooks - prevents self-validation vulnerability
      // Component (PascalCase) should still be detected
      const hasRenderHello = result.components.some(c => c.name === "renderHello");
      const hasComponent = result.components.some(c => c.name === "Component");

      console.log('renderHello detected as component:', hasRenderHello);
      console.log('Component detected as component:', hasComponent);

      // Camelcase render helper should NOT be detected (strict PascalCase)
      expect(hasRenderHello).toBe(false);
    });

    it("should NOT detect camelCase function with JSX-only (no hooks)", () => {
      const code = `
        function renderThis() {
          return <This/>;
        }

        function That() {
          return renderThis();
        }
      `;
      const context: TransformContext = {
        filename: "That.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // renderThis has JSX but is camelCase and no hooks - NOT a component
      // That has no JSX or hooks - not a component
      const hasRenderThis = result.components.some(c => c.name === "renderThis");
      const hasThat = result.components.some(c => c.name === "That");

      console.log('renderThis detected as component:', hasRenderThis);
      console.log('That detected as component:', hasThat);

      expect(hasRenderThis).toBe(false);
      expect(hasThat).toBe(false);
    });
  });

  describe("Valid component patterns still work", () => {
    it("should inject into regular component with hooks", () => {
      const code = `
        function MyComponent() {
          const [count, setCount] = useState(0);
          return <div>{count}</div>;
        }
      `;
      const context: TransformContext = {
        filename: "MyComponent.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
      expect(result.code).toContain("useReactTracer");
    });

    it("should inject into component returning JSX", () => {
      const code = `
        const Button = () => <button>Click me</button>;
      `;
      const context: TransformContext = {
        filename: "Button.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
    });

    it("should inject into memo-wrapped component", () => {
      const code = `
        import { memo } from 'react';

        const MemoComponent = memo(() => <div>Memoized</div>);
      `;
      const context: TransformContext = {
        filename: "MemoComponent.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(true);
      expect(result.code).toContain("useReactTracer");
    });

    it("should inject into forwardRef-wrapped component", () => {
      const code = `
        import { forwardRef } from 'react';

        const RefComponent = forwardRef((props, ref) => <div ref={ref}>Forwarded</div>);
      `;
      const context: TransformContext = {
        filename: "RefComponent.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(true);
      expect(result.code).toContain("useReactTracer");
    });

    it("should inject into component with conditional JSX", () => {
      const code = `
        function ConditionalComponent({ show }: { show: boolean }) {
          if (show) {
            return <div>Shown</div>;
          }
          return null;
        }
      `;
      const context: TransformContext = {
        filename: "ConditionalComponent.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
    });
  });

  describe("Async utility functions", () => {
    it("should NOT inject into async initialization function with JSX", () => {
      const code = `
        const startApp = async () => {
          await initializeServices();
          return <App />;
        };
      `;
      const context: TransformContext = {
        filename: "bootstrap.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // Async functions are never components, even if they return JSX
      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
      expect(result.code).not.toContain("useReactTracer");
    });

    it("should NOT inject into async data loader", () => {
      const code = `
        async function loadUserData(id: string) {
          const response = await fetch(\`/api/users/\${id}\`);
          return response.json();
        }
      `;
      const context: TransformContext = {
        filename: "api.ts",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
    });

    it("should NOT inject into async utility with conditional JSX", () => {
      const code = `
        const maybeRenderApp = async (condition: boolean) => {
          await checkPermissions();
          if (condition) {
            return <App />;
          }
          return <Login />;
        };
      `;
      const context: TransformContext = {
        filename: "auth.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
    });
  });
});
