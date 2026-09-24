import { describe, it, expect, vi } from "vitest";

// This test ensures the fallback branches for traverse/generator default exports are covered
describe("babel interop fallbacks", () => {
  it("uses .default when traverse/generator are not functions", async () => {
    vi.resetModules();

    vi.doMock("@babel/traverse", () => ({
      default: (_ast: unknown, _visitors: unknown) => {
        // no-op traversal: intentionally does nothing
      },
    }));

    vi.doMock("@babel/generator", () => ({
      default: () => ({ code: "// generated", map: undefined as unknown }),
    }));

  const { transform } = await import("../../src/functions/transform/transform.js");

    const code = `
      function MyComponent() {
        return <div/>;
      }
    `;

    const result = transform(code, {
      filename: "src/MyComponent.tsx",
      config: {
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: { paths: ["**/*.tsx"] },
        exclude: { paths: [] },
        labelHooks: ["useState"],
        labelHooksPattern: "",
        serverComponents: false,
      },
    });

    // With no-op traverse, nothing is injected; generator fallback returns our stub
    expect(result.injected).toBe(false);
    expect(result.code).toBe("// generated");
  });
});
