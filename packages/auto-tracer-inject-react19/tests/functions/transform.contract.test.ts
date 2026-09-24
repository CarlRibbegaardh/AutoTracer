import { describe, it, expect } from "vitest";
import { transform } from "../../src/functions/transform/transform";
import type { TransformContext } from "../../src/interfaces/TransformContext";

/**
 * Phase 2: TransformResult Contract Validation Tests
 *
 * These tests validate the contract between inject-react18 and its consumers
 * (like vite-react18 plugin). The TransformResult contract guarantees:
 *
 * 1. When injected=false, code is unchanged (or only whitespace-normalized)
 * 2. When components=[], injected must be false
 * 3. Import is added if and only if injected=true
 *
 * Consumers rely on these invariants to make decisions about whether to
 * process the transformed code or use the original.
 */

const DEFAULT_CONFIG = {
  mode: "opt-out" as const,
  importSource: "@autotracer/react18",
  include: { paths: ["**/*.tsx", "**/*.ts"], components: [] },
  exclude: { paths: ["**/*.test.*", "**/*.spec.*"], components: [] },
  labelHooks: ["useState", "useReducer"],
  labelHooksPattern: "",
  serverComponents: false,
};

function normalizeWhitespace(code: string): string {
  return code
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*([{}();,:])\s*/g, "$1");
}

describe("TransformResult Contract Validation - Phase 2", () => {
  describe("injected: false implies code unchanged", () => {
    it("should return unchanged code when injected=false (non-component file)", () => {
      const code = `
        // Just a utility function, not a component
        export function calculateTotal(items: number[]): number {
          return items.reduce((sum, item) => sum + item, 0);
        }
      `;
      const context: TransformContext = {
        filename: "utils.ts",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);

      // Code should be unchanged (allowing for whitespace normalization)
      expect(normalizeWhitespace(result.code)).toBe(normalizeWhitespace(code));
    });

    it("should return unchanged code when injected=false (pragma disabled)", () => {
      const code = `
        // @trace-disable
        export const MyComponent = () => {
          const [count, setCount] = useState(0);
          return <div>{count}</div>;
        };
      `;
      const context: TransformContext = {
        filename: "MyComponent.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);

      // Code should be unchanged
      expect(normalizeWhitespace(result.code)).toBe(normalizeWhitespace(code));
    });

    it("should return unchanged code when injected=false (opt-in mode without pragma)", () => {
      const code = `
        export const MyComponent = () => {
          const [count, setCount] = useState(0);
          return <div>{count}</div>;
        };
      `;
      const context: TransformContext = {
        filename: "MyComponent.tsx",
        config: {
          ...DEFAULT_CONFIG,
          mode: "opt-in", // Requires @trace pragma
        },
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);

      // Code should be unchanged
      expect(normalizeWhitespace(result.code)).toBe(normalizeWhitespace(code));
    });

    it("should return unchanged code when injected=false (RSC server component)", () => {
      const code = `
        export const ServerComponent = () => {
          const data = fetchData();
          return <div>{data}</div>;
        };
      `;
      const context: TransformContext = {
        filename: "ServerComponent.tsx",
        config: {
          ...DEFAULT_CONFIG,
          serverComponents: true, // RSC mode enabled
        },
      };

      const result = transform(code, context);

      // Server component without "use client" should not be transformed
      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);

      // Code should be unchanged
      expect(normalizeWhitespace(result.code)).toBe(normalizeWhitespace(code));
    });
  });

  describe("components: [] correlates with injected: false", () => {
    it("should have injected=false when no components detected (plain JS/TS)", () => {
      const code = `
        export const API_URL = "https://api.example.com";
        export const TIMEOUT = 5000;

        export function createClient(config: Config) {
          return new Client(config);
        }
      `;
      const context: TransformContext = {
        filename: "config.ts",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.components).toHaveLength(0);
      expect(result.injected).toBe(false);
      expect(result.code).not.toContain("useReactTracer");
      expect(result.code).not.toContain("import { useReactTracer }");
    });

    it("should have injected=false when components filtered by pragma", () => {
      const code = `
        // @trace-disable
        export const FilteredComponent = () => <div>Test</div>;
      `;
      const context: TransformContext = {
        filename: "FilteredComponent.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.components).toHaveLength(0);
      expect(result.injected).toBe(false);
    });

    it("should have injected=false when components filtered by mode", () => {
      const code = `
        export const ComponentNeedsPragma = () => {
          const [value, setValue] = useState(0);
          return <div>{value}</div>;
        };
      `;
      const context: TransformContext = {
        filename: "ComponentNeedsPragma.tsx",
        config: {
          ...DEFAULT_CONFIG,
          mode: "opt-in", // Requires @trace pragma
        },
      };

      const result = transform(code, context);

      expect(result.components).toHaveLength(0);
      expect(result.injected).toBe(false);
    });

    it("should NOT inject into lowercase function with JSX-only (no hooks)", () => {
      const code = `
        // Lowercase function with JSX but no hooks - NOT a component
        export const myHelper = () => <div>Helper</div>;
      `;
      const context: TransformContext = {
        filename: "helper.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // JSX-only camelCase function is NOT a component (prevents crashes)
      expect(result.components).toHaveLength(0);
      expect(result.injected).toBe(false);
    });
  });

  describe("import added if and only if injected=true", () => {
    it("should add import when injected=true (component transformed)", () => {
      const code = `
        export const ValidComponent = () => {
          const [count, setCount] = useState(0);
          return <div>{count}</div>;
        };
      `;
      const context: TransformContext = {
        filename: "ValidComponent.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);

      // Import should be present
      expect(result.code).toContain("import { useReactTracer }");
      expect(result.code).toContain('from "@autotracer/react18"');

      // useReactTracer should be called
      expect(result.code).toContain("useReactTracer({ name:");
    });

    it("should NOT add import when injected=false (non-component)", () => {
      const code = `
        export function helperFunction() {
          return "not a component";
        }
      `;
      const context: TransformContext = {
        filename: "helper.ts",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);

      // Import should NOT be present
      expect(result.code).not.toContain("import { useReactTracer }");
      expect(result.code).not.toContain("useReactTracer");
    });

    it("should NOT add import when injected=false (pragma disabled)", () => {
      const code = `
        // @trace-disable
        export const DisabledComponent = () => <div>Test</div>;
      `;
      const context: TransformContext = {
        filename: "DisabledComponent.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);

      // Import should NOT be present
      expect(result.code).not.toContain("import { useReactTracer }");
    });

    it("should NOT duplicate import when component already has it", () => {
      const code = `
        import { useReactTracer } from "@autotracer/react18";

        export const ManualComponent = () => {
          const tracer = useReactTracer({ name: "ManualComponent" });
          return <div>Test</div>;
        };
      `;
      const context: TransformContext = {
        filename: "ManualComponent.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // Component is tracked, so injected=true
      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);

      // But import should NOT be duplicated
      const importMatches = result.code.match(/import.*useReactTracer.*from/g);
      expect(importMatches).toHaveLength(1);
    });

    it("should add single import for multiple components in same file", () => {
      const code = `
        export const ComponentA = () => <div>A</div>;
        export const ComponentB = () => <div>B</div>;
        export const ComponentC = () => <div>C</div>;
      `;
      const context: TransformContext = {
        filename: "Components.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(3);

      // Only ONE import should be added
      const importMatches = result.code.match(/import.*useReactTracer.*from/g);
      expect(importMatches).toHaveLength(1);

      // All three components should get useReactTracer
      expect(result.code).toContain('"ComponentA"');
      expect(result.code).toContain('"ComponentB"');
      expect(result.code).toContain('"ComponentC"');
    });
  });

  describe("components array accuracy", () => {
    it("should track all transformed components in components array", () => {
      const code = `
        export const Header = () => <header>Header</header>;
        export const Footer = () => <footer>Footer</footer>;
      `;
      const context: TransformContext = {
        filename: "Layout.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(2);
      expect(result.components[0].name).toBe("Header");
      expect(result.components[1].name).toBe("Footer");
    });

    it("should not track filtered components in components array", () => {
      const code = `
        // @trace-disable
        export const FilteredComponent = () => <div>Filtered</div>;
      `;
      const context: TransformContext = {
        filename: "FilteredComponent.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
    });

    it("should track component even when no hooks to label", () => {
      const code = `
        export const SimpleComponent = ({ text }: { text: string }) => {
          return <div>{text}</div>;
        };
      `;
      const context: TransformContext = {
        filename: "SimpleComponent.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // Component should still be tracked (Phase 1 fix)
      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("SimpleComponent");

      // useReactTracer should be injected
      expect(result.code).toContain("useReactTracer({ name:");
    });
  });
});
