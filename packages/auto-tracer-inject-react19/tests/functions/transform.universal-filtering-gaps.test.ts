import { describe, expect, it } from "vitest";
import { normalizeConfig } from "../../src/functions/config/normalizeConfig";
import { transform } from "../../src/functions/transform/transform";
import type { TransformContext } from "../../src/interfaces/TransformContext";

describe("Universal filtering gaps (regression tests)", () => {
  it("HOC-wrapped variable declarators must respect include.components", () => {
    const code = `
      import { memo } from "react";

      export const Allowed = () => <div>allowed</div>;
      export const Wrapped = memo(() => <div>wrapped</div>);
    `;

    const config = normalizeConfig({
      mode: "opt-out",
      importSource: "@autotracer/react18",
      include: {
        paths: ["src/**/*.tsx"],
        components: ["Allowed"],
      },
      exclude: {
        paths: [],
        components: [],
      },
      labelHooks: [],
    });

    const context: TransformContext = {
      filename: "src/components/Example.tsx",
      config,
    };

    const result = transform(code, context);

    expect(result.injected).toBe(true);
    expect(result.components.map((c) => c.name)).toEqual(["Allowed"]);
    expect(result.code).toContain("useReactTracer");
  });

  it("anonymous default export must be excluded when include.components is provided", () => {
    const code = `
      export default () => <div>default</div>;
    `;

    const config = normalizeConfig({
      mode: "opt-out",
      importSource: "@autotracer/react18",
      include: {
        paths: ["src/**/*.tsx"],
        components: ["AnyNamedComponent"],
      },
      exclude: {
        paths: [],
        components: [],
      },
      labelHooks: [],
    });

    const context: TransformContext = {
      filename: "src/pages/Foo.tsx",
      config,
    };

    const result = transform(code, context);

    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
    expect(result.code).not.toContain("useReactTracer");
  });

  it("anonymous default export must honor @trace-disable", () => {
    const code = `
      // @trace-disable
      export default () => <div>default</div>;
    `;

    const config = normalizeConfig({
      mode: "opt-out",
      importSource: "@autotracer/react18",
      include: {
        paths: ["src/**/*.tsx"],
        components: [],
      },
      exclude: {
        paths: [],
        components: [],
      },
      labelHooks: [],
    });

    const context: TransformContext = {
      filename: "src/pages/Bar.tsx",
      config,
    };

    const result = transform(code, context);

    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
    expect(result.code).not.toContain("useReactTracer");
  });
});
