import { describe, it, expect } from "vitest";
import { transform } from "../../src/functions/transform/transform";
import type { TransformContext } from "../../src/interfaces/TransformContext";

/**
 * Phase 4: Mode & Filtering Tests
 *
 * These tests validate opt-in/opt-out mode behavior, pragma precedence rules,
 * and cross-platform path handling. Ensures consistent behavior across
 * different configuration modes and file filtering scenarios.
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

describe("Mode & Filtering - Phase 4", () => {
  describe("Opt-out mode edge cases", () => {
    it("should transform all components by default in opt-out mode", () => {
      const code = `
        export const ComponentA = () => <div>A</div>;
        export const ComponentB = () => <div>B</div>;
        export const ComponentC = () => <div>C</div>;
      `;
      const context: TransformContext = {
        filename: "Components.tsx",
        config: {
          ...DEFAULT_CONFIG,
          mode: "opt-out",
        },
      };

      const result = transform(code, context);

      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(3);
      expect(result.components.map((c) => c.name)).toEqual([
        "ComponentA",
        "ComponentB",
        "ComponentC",
      ]);
    });

    it("should skip only the component with @trace-disable pragma in opt-out mode, not the whole file", () => {
      const code = `
        export const NormalComponent = () => <div>Normal</div>;

        // @trace-disable
        export const DisabledComponent = () => <div>Disabled</div>;

        export const AnotherNormalComponent = () => <div>Another</div>;
      `;
      const context: TransformContext = {
        filename: "Mixed.tsx",
        config: {
          ...DEFAULT_CONFIG,
          mode: "opt-out",
        },
      };

      const result = transform(code, context);

      // @trace-disable on DisabledComponent skips that component; others are traced in opt-out mode
      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(2);
      expect(result.components.map((c) => c.name)).toEqual([
        "NormalComponent",
        "AnotherNormalComponent",
      ]);
    });

    it("should skip first component with function-level @trace-disable in opt-out mode", () => {
      const code = `
        // @trace-disable
        export const ComponentA = () => <div>A</div>;

        export const ComponentB = () => <div>B</div>;
      `;
      const context: TransformContext = {
        filename: "DisabledFile.tsx",
        config: {
          ...DEFAULT_CONFIG,
          mode: "opt-out",
        },
      };

      const result = transform(code, context);

      // Only ComponentA is skipped (has pragma), ComponentB is transformed (opt-out mode)
      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("ComponentB");
    });
  });

  describe("Opt-in mode edge cases", () => {
    it("should NOT transform components without @trace pragma in opt-in mode", () => {
      const code = `
        export const ComponentA = () => <div>A</div>;
        export const ComponentB = () => <div>B</div>;
      `;
      const context: TransformContext = {
        filename: "Components.tsx",
        config: {
          ...DEFAULT_CONFIG,
          mode: "opt-in",
        },
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
    });

    it("should transform only first component with function-level @trace pragma in opt-in mode", () => {
      const code = `
        // @trace
        export const ComponentA = () => <div>A</div>;

        export const ComponentB = () => <div>B</div>;
      `;
      const context: TransformContext = {
        filename: "TracedFile.tsx",
        config: {
          ...DEFAULT_CONFIG,
          mode: "opt-in",
        },
      };

      const result = transform(code, context);

      // Only ComponentA is transformed (has @trace pragma), ComponentB is skipped (opt-in mode, no pragma)
      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("ComponentA");
    });

    it("should skip component with @trace-disable while tracing component with @trace in opt-in mode", () => {
      const code = `
        // @trace

        export const NormalComponent = () => <div>Normal</div>;

        // @trace-disable
        export const DisabledComponent = () => <div>Disabled</div>;
      `;
      const context: TransformContext = {
        filename: "Mixed.tsx",
        config: {
          ...DEFAULT_CONFIG,
          mode: "opt-in",
        },
      };

      const result = transform(code, context);

      // @trace attached to NormalComponent enables it in opt-in mode
      // @trace-disable on DisabledComponent skips it
      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("NormalComponent");
    });
  });

  describe("Pragma precedence rules", () => {
    it("should honor @trace-disable over @trace when both present (opt-out mode)", () => {
      const code = `
        // @trace
        // @trace-disable

        export const Component = () => <div>Test</div>;
      `;
      const context: TransformContext = {
        filename: "Conflict.tsx",
        config: {
          ...DEFAULT_CONFIG,
          mode: "opt-out",
        },
      };

      const result = transform(code, context);

      // @trace-disable wins
      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
    });

    it("should honor @trace-disable over @trace when both present (opt-in mode)", () => {
      const code = `
        // @trace
        // @trace-disable

        export const Component = () => <div>Test</div>;
      `;
      const context: TransformContext = {
        filename: "Conflict.tsx",
        config: {
          ...DEFAULT_CONFIG,
          mode: "opt-in",
        },
      };

      const result = transform(code, context);

      // @trace-disable still wins in opt-in mode
      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
    });

    it("should treat @trace as no-op in opt-out mode (already enabled)", () => {
      const code = `
        // @trace

        export const Component = () => <div>Test</div>;
      `;
      const context: TransformContext = {
        filename: "ExplicitTrace.tsx",
        config: {
          ...DEFAULT_CONFIG,
          mode: "opt-out",
        },
      };

      const result = transform(code, context);

      // In opt-out mode, @trace doesn't change anything (already enabled)
      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
    });
  });

  describe("Include/exclude pattern matching", () => {
    it("should not transform test files when excluded by path pattern", () => {
      const code = `
        export const TestComponent = () => <div>Test</div>;
      `;
      const context: TransformContext = {
        filename: "Component.test.tsx",
        config: {
          ...DEFAULT_CONFIG,
          exclude: { paths: ["**/*.test.*", "**/*.spec.*"] },
        },
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
    });

    it("should not transform spec files when excluded by path pattern", () => {
      const code = `
        export const SpecComponent = () => <div>Spec</div>;
      `;
      const context: TransformContext = {
        filename: "Component.spec.tsx",
        config: {
          ...DEFAULT_CONFIG,
          exclude: { paths: ["**/*.test.*", "**/*.spec.*"] },
        },
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
    });

    it("should transform files matching include pattern", () => {
      const code = `
        export const Component = () => <div>Test</div>;
      `;
      const context: TransformContext = {
        filename: "src/components/Component.tsx",
        config: {
          ...DEFAULT_CONFIG,
          include: { paths: ["**/*.tsx"] },
          exclude: { paths: ["**/*.test.*"] },
        },
      };

      const result = transform(code, context);

      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
    });

    it("should not transform .ts files when only .tsx files are included", () => {
      const code = `
        export const Component = () => <div>Test</div>;
      `;
      const context: TransformContext = {
        filename: "Component.ts", // .ts file
        config: {
          ...DEFAULT_CONFIG,
          include: { paths: ["**/*.tsx"] }, // Only .tsx
          exclude: { paths: [] },
        },
      };

      const result = transform(code, context);

      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
    });
  });

  describe("Cross-platform path handling", () => {
    it("should handle Windows-style absolute paths", () => {
      const code = `
        export const Component = () => <div>Test</div>;
      `;
      const context: TransformContext = {
        filename: "C:\\Users\\dev\\project\\src\\Component.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
    });

    it("should handle Unix-style absolute paths", () => {
      const code = `
        export const Component = () => <div>Test</div>;
      `;
      const context: TransformContext = {
        filename: "/home/dev/project/src/Component.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
    });

    it("should handle relative paths", () => {
      const code = `
        export const Component = () => <div>Test</div>;
      `;
      const context: TransformContext = {
        filename: "src/components/Component.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
    });

    it("should extract basename correctly from nested Windows paths for anonymous defaults", () => {
      const code = `
        export default () => <div>Test</div>;
      `;
      const context: TransformContext = {
        filename: "C:\\Users\\dev\\project\\src\\pages\\Dashboard.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("Dashboard_default");
    });

    it("should extract basename correctly from nested Unix paths for anonymous defaults", () => {
      const code = `
        export default () => <div>Test</div>;
      `;
      const context: TransformContext = {
        filename: "/home/dev/project/src/pages/Dashboard.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("Dashboard_default");
    });
  });

  describe("RSC (React Server Components) mode", () => {
    it("should skip transformation when serverComponents enabled and no 'use client' directive", () => {
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
          serverComponents: true,
        },
      };

      const result = transform(code, context);

      // Server components without "use client" should not be transformed
      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
    });

    it("should transform when serverComponents enabled WITH 'use client' directive", () => {
      const code = `
        'use client';

        export const ClientComponent = () => {
          const [count, setCount] = useState(0);
          return <div>{count}</div>;
        };
      `;
      const context: TransformContext = {
        filename: "ClientComponent.tsx",
        config: {
          ...DEFAULT_CONFIG,
          serverComponents: true,
        },
      };

      const result = transform(code, context);

      // Client components WITH "use client" should be transformed
      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("ClientComponent");
    });

    it("should transform all components when serverComponents disabled (default)", () => {
      const code = `
        export const Component = () => {
          return <div>Test</div>;
        };
      `;
      const context: TransformContext = {
        filename: "Component.tsx",
        config: {
          ...DEFAULT_CONFIG,
          serverComponents: false,
        },
      };

      const result = transform(code, context);

      // When RSC mode is disabled, all components are transformed
      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
    });
  });
});
