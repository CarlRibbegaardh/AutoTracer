import { describe, it, expect } from "vitest";
import { transform } from "../../src/functions/transform/transform";
import { normalizeConfig } from "../../src/functions/config/normalizeConfig";
import type { TransformContext } from "../../src/interfaces/TransformContext";

/**
 * Bug reproduction tests for nested include/exclude config structure.
 *
 * Issue: After migrating from flat arrays to nested objects:
 *   OLD: include: ['src/**\/*.tsx']
 *   NEW: include: { paths: ['src/**\/*.tsx'] }
 *
 * Components are not being instrumented even when they should match the patterns.
 */
describe("Nested config structure (include/exclude migration)", () => {
  describe("basic component instrumentation with nested config", () => {
    it("should instrument component with nested include.paths", () => {
      const code = `
        export function LocationEditor() {
          const formHook = useForm({
            defaultValues: { name: "Home" }
          });
          return <div>Editor</div>;
        }
      `;

      const config = normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: {
          paths: ["src/**/*.tsx"],
        },
        exclude: {
          paths: ["**/*.test.*", "**/*.spec.*"],
        },
        labelHooks: ["useState", "useReducer", "useSelector"],
        labelHooksPattern: "^use[A-Z].*",
      });

      const context: TransformContext = {
        filename: "src/pages/LocationEditor.tsx",
        config,
      };

      const result = transform(code, context);

      // Should have injected useReactTracer
      expect(result.code).toContain("useReactTracer");
      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("LocationEditor");
    });

    it("should instrument component with nested exclude.paths", () => {
      const code = `
        export function Button() {
          const [count, setCount] = useState(0);
          return <button>{count}</button>;
        }
      `;

      const config = normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: {
          paths: ["src/**/*.tsx"],
        },
        exclude: {
          paths: ["**/*.test.*", "**/*.spec.*"],
        },
        labelHooks: ["useState"],
      });

      const context: TransformContext = {
        filename: "src/components/Button.tsx",
        config,
      };

      const result = transform(code, context);

      expect(result.code).toContain("useReactTracer");
      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("Button");
    });

    it("should NOT instrument component matching nested exclude.paths", () => {
      const code = `
        export function Button() {
          const [count, setCount] = useState(0);
          return <button>{count}</button>;
        }
      `;

      const config = normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: {
          paths: ["src/**/*.tsx"],
        },
        exclude: {
          paths: ["**/*.test.*", "**/*.spec.*"],
        },
        labelHooks: ["useState"],
      });

      const context: TransformContext = {
        filename: "src/components/Button.test.tsx",
        config,
      };

      const result = transform(code, context);

      expect(result.code).not.toContain("useReactTracer");
      expect(result.injected).toBe(false);
      expect(result.components).toHaveLength(0);
    });
  });

  describe("component-level filtering with nested config", () => {
    it("should instrument only components matching include.components", () => {
      const code = `
        export function LocationEditor() {
          return <div>Editor</div>;
        }

        export function DebugPanel() {
          return <div>Debug</div>;
        }
      `;

      const config = normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: {
          paths: ["src/**/*.tsx"],
          components: ["LocationEditor"],
        },
        exclude: {
          paths: [],
        },
        labelHooks: [],
      });

      const context: TransformContext = {
        filename: "src/pages/Editor.tsx",
        config,
      };

      const result = transform(code, context);

      // Should instrument LocationEditor but not DebugPanel
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("LocationEditor");
      expect(result.injected).toBe(true);
    });

    it("should NOT instrument components matching exclude.components", () => {
      const code = `
        export function LocationEditor() {
          return <div>Editor</div>;
        }

        export function DebugPanel() {
          return <div>Debug</div>;
        }
      `;

      const config = normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: {
          paths: ["src/**/*.tsx"],
        },
        exclude: {
          paths: [],
          components: ["DebugPanel"],
        },
        labelHooks: [],
      });

      const context: TransformContext = {
        filename: "src/pages/Editor.tsx",
        config,
      };

      const result = transform(code, context);

      // Should instrument LocationEditor but not DebugPanel
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("LocationEditor");
      expect(result.injected).toBe(true);
    });

    it("should handle glob patterns in exclude.components", () => {
      const code = `
        export function DebugPanel() {
          return <div>Debug</div>;
        }

        export function DebugToolbar() {
          return <div>Toolbar</div>;
        }

        export function UserProfile() {
          return <div>Profile</div>;
        }
      `;

      const config = normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: {
          paths: ["src/**/*.tsx"],
        },
        exclude: {
          paths: [],
          components: ["Debug*"],
        },
        labelHooks: [],
      });

      const context: TransformContext = {
        filename: "src/components/Mixed.tsx",
        config,
      };

      const result = transform(code, context);

      // Should only instrument UserProfile
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("UserProfile");
    });

    it("should handle regex patterns in exclude.components", () => {
      const code = `
        export function InternalButton() {
          return <div>Button</div>;
        }

        export function InternalPanel() {
          return <div>Panel</div>;
        }

        export function PublicButton() {
          return <div>Button</div>;
        }
      `;

      const config = normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: {
          paths: ["src/**/*.tsx"],
        },
        exclude: {
          paths: [],
          components: [/^Internal/],
        },
        labelHooks: [],
      });

      const context: TransformContext = {
        filename: "src/components/Buttons.tsx",
        config,
      };

      const result = transform(code, context);

      // Should only instrument PublicButton
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe("PublicButton");
    });
  });

  describe("empty nested config defaults", () => {
    it("should handle undefined include/exclude gracefully", () => {
      const code = `
        export function Button() {
          return <button>Click</button>;
        }
      `;

      const config = normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
      });

      const context: TransformContext = {
        filename: "src/Button.tsx",
        config,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
    });

    it("should handle empty paths arrays in nested config", () => {
      const code = `
        export function Button() {
          return <button>Click</button>;
        }
      `;

      const config = normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: {
          paths: [],
        },
        exclude: {
          paths: [],
        },
      });

      const context: TransformContext = {
        filename: "src/Button.tsx",
        config,
      };

      const result = transform(code, context);

      expect(result.injected).toBe(true);
      expect(result.components).toHaveLength(1);
    });
  });

  describe("backward compatibility", () => {
    it("should normalize legacy flat arrays to nested structure", () => {
      // This tests that normalizeConfig properly handles the old format
      // even though TypeScript types don't allow it, runtime might see it
      const config = normalizeConfig({
        mode: "opt-out",
        importSource: "@autotracer/react18",
        // @ts-expect-error - testing backward compatibility with old format
        include: ["src/**/*.tsx"],
        // @ts-expect-error - testing backward compatibility with old format
        exclude: ["**/*.test.*"],
        labelHooks: ["useState"],
      });

      // Should have been normalized to nested structure
      expect(config.include).toHaveProperty("paths");
      expect(config.exclude).toHaveProperty("paths");
      expect(config.include.components).toBeDefined();
      expect(config.exclude.components).toBeDefined();
    });
  });
});
