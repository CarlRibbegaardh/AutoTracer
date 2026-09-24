import { describe, it, expect } from "vitest";
import { transform } from "../../src/functions/transform/transform";
import type { TransformContext } from "../../src/interfaces/TransformContext";

/**
 * Phase 1: Transformation Correctness Tests
 *
 * These tests verify that ALL matching React components receive useReactTracer() injection,
 * even when they have no hooks to label. The useReactTracer() call provides:
 * - Stable component name for tracking
 * - Definitive render marker in traces
 * - Component lifecycle tracking
 *
 * Without it, the component is invisible to the tracing system.
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

describe("Transformation Correctness - Phase 1", () => {
  describe("Components with no hooks to label", () => {
    it("SHOULD transform component with only props (no hooks to label)", () => {
      const code = `
        export const CompletionRateCard = ({ completed, total }: Props) => {
          return <Box sx={{ mt: 3 }}>Progress: {completed}/{total}</Box>;
        };
      `;
      const context: TransformContext = {
        filename: "CompletionRateCard.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // ✅ Component should be instrumented
      expect(result.injected).toBe(true);

      // ✅ Import should be added
      expect(result.code).toContain("import { useReactTracer }");
      expect(result.code).toContain('from "@autotracer/react18"');

      // ✅ useReactTracer() call should be injected
      expect(result.code).toContain("const __reactTracer = useReactTracer({ name:");
      expect(result.code).toContain('"CompletionRateCard"');

      // ✅ No labelState calls (no hooks to label)
      expect(result.code).not.toContain("labelState");

      // ✅ Component should be tracked
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("CompletionRateCard");
    });

    it("SHOULD transform component with only JSX return (no logic)", () => {
      const code = `
        export const Header = () => (
          <header>
            <h1>App Title</h1>
          </header>
        );
      `;
      const context: TransformContext = {
        filename: "Header.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // ✅ Component should be instrumented
      expect(result.injected).toBe(true);

      // ✅ Import should be added
      expect(result.code).toContain("import { useReactTracer }");

      // ✅ useReactTracer() call should be injected
      // Note: Arrow expression body must be converted to block statement
      expect(result.code).toContain("const __reactTracer = useReactTracer({ name:");
      expect(result.code).toContain('"Header"');

      // ✅ No labelState calls
      expect(result.code).not.toContain("labelState");

      // ✅ Component should be tracked
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("Header");
    });

    it("SHOULD transform component with non-labeled hooks only", () => {
      const code = `
        export const EffectOnlyComponent = () => {
          useEffect(() => {
            fetch('/api');
          }, []);
          return <div>Loading...</div>;
        };
      `;
      const context: TransformContext = {
        filename: "EffectOnlyComponent.tsx",
        config: {
          ...DEFAULT_CONFIG,
          labelHooks: ["useState"], // useEffect NOT configured
        },
      };

      const result = transform(code, context);

      // ✅ Component should be instrumented (even though useEffect is not labeled)
      expect(result.injected).toBe(true);

      // ✅ Import should be added
      expect(result.code).toContain("import { useReactTracer }");

      // ✅ useReactTracer() call should be injected
      expect(result.code).toContain("const __reactTracer = useReactTracer({ name:");
      expect(result.code).toContain('"EffectOnlyComponent"');

      // ✅ No labelState calls (useEffect not in labelHooks list)
      expect(result.code).not.toContain("labelState");

      // ✅ Component should be tracked
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("EffectOnlyComponent");
    });
  });

  describe("Components already instrumented", () => {
    it("should NOT add duplicate useReactTracer when component already has it", () => {
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

      // ✅ Should NOT add duplicate useReactTracer call
      const useReactTracerMatches = result.code.match(/useReactTracer\(/g);
      expect(useReactTracerMatches).toHaveLength(1);

      // ✅ Should NOT add duplicate import
      const importMatches = result.code.match(/import.*useReactTracer.*from/g);
      expect(importMatches).toHaveLength(1);

      // ✅ Component is tracked (detected)
      expect(result.components).toHaveLength(1);

      // Note: injected=true because the component is being tracked,
      // even though we didn't add new instrumentation
      // This matches existing behavior in transform.labels.test.ts line 868
      expect(result.injected).toBe(true);
    });
  });

  describe("Non-component code", () => {
    it("should return injected: false for class components", () => {
      const code = `
        class MyClass extends React.Component {
          render() {
            return <div>Test</div>;
          }
        }
      `;
      const context: TransformContext = {
        filename: "MyClass.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // ✅ Class components should NOT be instrumented
      expect(result.injected).toBe(false);

      // ✅ No import should be added
      expect(result.code).not.toContain("import { useReactTracer }");

      // ✅ No useReactTracer call
      expect(result.code).not.toContain("useReactTracer");

      // ✅ No components tracked
      expect(result.components).toHaveLength(0);
    });
  });

  describe("Multiple components in same file", () => {
    it("should transform all components, even those without hooks to label", () => {
      const code = `
        export const Header = () => <h1>Title</h1>;

        export const Body = ({ content }: { content: string }) => {
          return <div>{content}</div>;
        };

        export const Footer = () => {
          const [year] = useState(2025);
          return <footer>© {year}</footer>;
        };
      `;
      const context: TransformContext = {
        filename: "Layout.tsx",
        config: DEFAULT_CONFIG,
      };

      const result = transform(code, context);

      // ✅ All three components should be instrumented
      expect(result.injected).toBe(true);

      // ✅ Single import added
      const importMatches = result.code.match(/import.*useReactTracer.*from/g);
      expect(importMatches).toHaveLength(1);

      // ✅ All three components get useReactTracer() call
      expect(result.code).toContain('"Header"');
      expect(result.code).toContain('"Body"');
      expect(result.code).toContain('"Footer"');

      // ✅ Only Footer has labelState (has useState)
      const labelStateMatches = result.code.match(/labelState/g);
      expect(labelStateMatches).toHaveLength(1);

      // ✅ All three components tracked
      expect(result.components).toHaveLength(3);
      expect(result.components.map(c => c.name)).toEqual(
        expect.arrayContaining(["Header", "Body", "Footer"])
      );
    });
  });
});
