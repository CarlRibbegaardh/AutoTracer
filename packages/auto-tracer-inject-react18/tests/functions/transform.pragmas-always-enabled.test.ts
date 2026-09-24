import { describe, expect, it } from "vitest";
import { transform } from "../../src/functions/transform/transform";
import type { TransformConfig } from "../../src/interfaces/TransformConfig";
import type { TransformContext } from "../../src/interfaces/TransformContext";

describe("Pragmas are always enabled", () => {
  it("does not allow disablePragmas in TransformConfig", () => {
    // @ts-expect-error disablePragmas must not exist.
    const _badConfig = { mode: "opt-out", disablePragmas: true } satisfies TransformConfig;

    expect(_badConfig).toBeDefined();
  });

  it("honors @trace-disable", () => {
    const code = `
      // @trace-disable
      export function MyComponent() {
        return <div>Hello</div>;
      }
    `;

    const context: TransformContext = {
      filename: "src/MyComponent.tsx",
      config: {
        mode: "opt-out",
        importSource: "@autotracer/react18",
        include: { paths: ["src/**/*.tsx"], components: [] },
        exclude: { paths: [], components: [] },
        labelHooks: [],
        labelHooksPattern: "",
        serverComponents: false,
      },
    };

    const result = transform(code, context);

    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
    expect(result.code).not.toContain("useReactTracer");
  });
});
