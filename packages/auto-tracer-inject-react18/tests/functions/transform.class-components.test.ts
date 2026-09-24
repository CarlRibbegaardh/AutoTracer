import { describe, it, expect } from "vitest";
import { transform } from "../../src/functions/transform/transform";
import type { TransformContext } from "../../src/interfaces/TransformContext";

const DEFAULT_CONFIG: TransformContext["config"] = {
  mode: "opt-out",
  importSource: "@autotracer/react18",
  include: {
    paths: ["**/*.tsx", "**/*.ts"],
    components: [],
  },
  exclude: {
    paths: ["**/*.test.*", "**/*.spec.*"],
    components: [],
  },
  labelHooks: ["useState", "useReducer"],
  labelHooksPattern: "",
  serverComponents: false,
};

describe("Class component behavior", () => {
  it("does not inject into class components", () => {
    const code = `
      import React from "react";

      export class ClassComponent extends React.Component {
        public override render() {
          return <div>Class component</div>;
        }
      }
    `;

    const context: TransformContext = {
      filename: "ClassComponent.tsx",
      config: DEFAULT_CONFIG,
    };

    const result = transform(code, context);

    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
    expect(result.code).not.toContain("useReactTracer");
  });
});
