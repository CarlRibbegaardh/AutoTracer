import { describe, it, expect } from "vitest";
import { transform } from "../../src/functions/transform/transform";

const DEFAULT_CONFIG = {
  mode: "opt-out" as const,
  importSource: "@autotracer/react18",
  include: { paths: ["**/*.tsx", "**/*.ts"], components: [] },
  exclude: { paths: ["**/*.test.*", "**/*.spec.*"], components: [] },
  labelHooks: ["useState", "useReducer"],
  labelHooksPattern: "",
  serverComponents: false,
};

describe("Anonymous function edge cases - user concern", () => {
  it("array.map with JSX callback", () => {
    const code = `const rows = items.map(item => <Row item={item} />);`;
    const result = transform(code, { filename: "test.tsx", config: DEFAULT_CONFIG });

    console.log("\n=== ARRAY MAP ===");
    console.log("Code:", code);
    console.log("Injected:", result.injected);
    console.log("Components found:", result.components.length);
    console.log("Component names:", result.components.map(c => c.name));

    // map() is in isInNonComponentContext rejection list
    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
  });

  it("factory callback with JSX", () => {
    const code = `someFactory(() => <div />);`;
    const result = transform(code, { filename: "test.tsx", config: DEFAULT_CONFIG });

    console.log("\n=== FACTORY CALLBACK ===");
    console.log("Code:", code);
    console.log("Injected:", result.injected);
    console.log("Components found:", result.components.length);
    console.log("Component names:", result.components.map(c => c.name));

    // someFactory is NOT in rejection list - this WILL be instrumented currently!
    // This is a potential false positive
  });

  it("conditional JSX function assignment", () => {
    const code = `const renderThing = condition ? () => <A /> : () => <B />;`;
    const result = transform(code, { filename: "test.tsx", config: DEFAULT_CONFIG });

    console.log("\n=== CONDITIONAL ASSIGNMENT ===");
    console.log("Code:", code);
    console.log("Injected:", result.injected);
    console.log("Components found:", result.components.length);
    console.log("Component names:", result.components.map(c => c.name));

    // ConditionalExpression init - not handled specially
    // These anonymous functions may or may not be instrumented
  });

  it("valid default export anonymous", () => {
    const code = `export default () => <div>Valid</div>;`;
    const result = transform(code, { filename: "test.tsx", config: DEFAULT_CONFIG });

    console.log("\n=== DEFAULT EXPORT ANONYMOUS ===");
    console.log("Code:", code);
    console.log("Injected:", result.injected);
    console.log("Components found:", result.components.length);
    console.log("Component names:", result.components.map(c => c.name));

    // This SHOULD be instrumented - it's a valid component pattern
    expect(result.injected).toBe(true);
    expect(result.components.length).toBeGreaterThan(0);
  });
});
