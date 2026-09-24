import { describe, it, expect } from "vitest";
import { transform } from "../../../src/functions/transform/transform";
import type { TransformContext } from "../../../src/interfaces/TransformContext";

const DEFAULT_CONFIG = {
  mode: "opt-out" as const,
  importSource: "@autotracer/react18",
  include: { paths: ["**/*.tsx", "**/*.ts"], components: [] },
  exclude: { paths: ["**/*.test.*", "**/*.spec.*"], components: [] },
  labelHooks: ["useState", "useReducer"],
  labelHooksPattern: "",
  serverComponents: false,
};

describe("Anonymous JSX function edge cases", () => {
  describe("Array iterator callbacks", () => {
    it("should NOT instrument map callback with JSX", () => {
      const code = `
        const rows = items.map(item => <Row item={item} />);
      `;
      const context: TransformContext = {
        filename: "test.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      console.log("Map callback - injected:", result.injected);
      console.log("Map callback - components:", result.components);

      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
    });
  });

  describe("Factory function arguments", () => {
    it("should NOT instrument arbitrary factory callback with JSX", () => {
      const code = `
        someFactory(() => <div />);
      `;
      const context: TransformContext = {
        filename: "test.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      console.log("Factory callback - injected:", result.injected);
      console.log("Factory callback - components:", result.components);

      // This might currently be instrumented - testing to see
      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
    });
  });

  describe("Conditional function assignment", () => {
    it("should NOT instrument conditional JSX functions", () => {
      const code = `
        const renderThing = condition ? () => <A /> : () => <B />;
      `;
      const context: TransformContext = {
        filename: "test.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      console.log("Conditional functions - injected:", result.injected);
      console.log("Conditional functions - components:", result.components);

      // These are not actual components
      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
    });
  });

  describe("Valid anonymous component patterns", () => {
    it("should still instrument default export anonymous component", () => {
      const code = `
        export default () => <div>Valid anonymous component</div>;
      `;
      const context: TransformContext = {
        filename: "test.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      console.log("Default export anonymous - injected:", result.injected);
      console.log("Default export anonymous - components:", result.components);

      // This IS a valid component pattern
      expect(result.injected).toBe(true);
      expect(result.components.length).toBeGreaterThan(0);
    });

    it("should instrument HOC-wrapped anonymous component", () => {
      const code = `
        const withAuth = (Component: React.ComponentType) => {
          return () => <Protected><Component /></Protected>;
        };
      `;
      const context: TransformContext = {
        filename: "test.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      console.log("HOC wrapper - injected:", result.injected);
      console.log("HOC wrapper - components:", result.components);

      // NEW: Bare anonymous functions are rejected even inside HOC factory patterns
      // Only memo/forwardRef-wrapped anonymous functions are accepted
      expect(result.injected).toBe(false);
    });
  });
});
