import { describe, it, expect } from "vitest";
import { transform } from "../../src/functions/transform/transform";
import type { TransformContext } from "../../src/interfaces/TransformContext";

const DEFAULT_CONFIG = {
  mode: "opt-out" as const,
  include: { paths: ["**/*.tsx", "**/*.jsx"], components: [] },
  exclude: { paths: ["**/*.test.tsx", "**/*.spec.tsx"], components: [] },
  serverComponents: false,
  importSource: "@autotracer/react18",
  labelHooks: [],
  labelHooksPattern: "",
};

describe("Function-Level Pragma Support - Category 1: Basic Behavior", () => {
  it("function-level @trace in opt-in mode transforms component", () => {
    const code = `
      // @trace
      function MyComponent() {
        return <div>Hello</div>;
      }
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: {
        ...DEFAULT_CONFIG,
        mode: "opt-in",
      },
    };

    const result = transform(code, context);

    expect(result.injected).toBe(true);
    expect(result.components).toHaveLength(1);
    expect(result.components[0].name).toBe("MyComponent");
    expect(result.code).toContain("useReactTracer");
  });

  it("function-level @trace-disable in opt-out mode skips transformation", () => {
    const code = `
      // @trace-disable
      function MyComponent() {
        return <div>Hello</div>;
      }
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: DEFAULT_CONFIG,
    };

    const result = transform(code, context);

    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
    expect(result.code).not.toContain("useReactTracer");
  });

  it("@trace pragma enables a component when @trace-disable is present only on a non-function node", () => {
    const code = `
      // @trace-disable

      import React from "react";

      // @trace
      function MyComponent() {
        return <div>Hello</div>;
      }
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: DEFAULT_CONFIG,
    };

    const result = transform(code, context);

    expect(result.injected).toBe(true);
    expect(result.components).toHaveLength(1);
    expect(result.components[0].name).toBe("MyComponent");
  });

  it("@trace-disable on a component overrides loose @trace present on a non-function node", () => {
    const code = `
      // @trace

      import React from "react";

      // @trace-disable
      function MyComponent() {
        return <div>Hello</div>;
      }
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: {
        ...DEFAULT_CONFIG,
        mode: "opt-in",
      },
    };

    const result = transform(code, context);

    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
  });

  it("function pragma before TSDoc comment works", () => {
    const code = `
      // @trace
      /**
       * Component documentation
       */
      function MyComponent() {
        return <div>Hello</div>;
      }
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: {
        ...DEFAULT_CONFIG,
        mode: "opt-in",
      },
    };

    const result = transform(code, context);

    expect(result.injected).toBe(true);
    expect(result.components).toHaveLength(1);
  });

  it("function pragma after TSDoc comment IS detected (block comments are fully ignored)", () => {
    const code = `
      /**
       * Component documentation
       */
      // @trace
      function MyComponent() {
        return <div>Hello</div>;
      }
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: {
        ...DEFAULT_CONFIG,
        mode: "opt-in",
      },
    };

    const result = transform(code, context);

    // Shared parser ignores CommentBlock nodes entirely — CommentLine after TSDoc IS detected.
    expect(result.injected).toBe(true);
    expect(result.components).toHaveLength(1);
  });

  it("function pragma with blank lines before function works", () => {
    const code = `
      // @trace


      function MyComponent() {
        return <div>Hello</div>;
      }
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: {
        ...DEFAULT_CONFIG,
        mode: "opt-in",
      },
    };

    const result = transform(code, context);

    expect(result.injected).toBe(true);
    expect(result.components).toHaveLength(1);
  });

  it("both function pragmas on same function - @trace-disable wins", () => {
    const code = `
      // @trace
      // @trace-disable
      function MyComponent() {
        return <div>Hello</div>;
      }
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: DEFAULT_CONFIG,
    };

    const result = transform(code, context);

    // @trace-disable always wins
    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
  });
});

describe("Function-Level Pragma Support - Category 2: Additional Host Shapes", () => {
  it("local const arrow function: @trace in opt-in mode enables tracing", () => {
    const code = `
      // @trace
      const Button = () => <div>Hello</div>;
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: { ...DEFAULT_CONFIG, mode: "opt-in" },
    };

    const result = transform(code, context);

    expect(result.injected).toBe(true);
    expect(result.components).toHaveLength(1);
    expect(result.components[0].name).toBe("Button");
  });

  it("local const arrow function: @trace-disable in opt-out mode disables tracing", () => {
    const code = `
      // @trace-disable
      const Button = () => <div>Hello</div>;
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: DEFAULT_CONFIG,
    };

    const result = transform(code, context);

    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
  });

  it("default-exported function declaration: @trace in opt-in mode enables tracing", () => {
    const code = `
      // @trace
      export default function Button() {
        return <div>Hello</div>;
      }
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: { ...DEFAULT_CONFIG, mode: "opt-in" },
    };

    const result = transform(code, context);

    expect(result.injected).toBe(true);
    expect(result.components).toHaveLength(1);
    expect(result.components[0].name).toBe("Button");
  });

  it("default-exported function declaration: @trace-disable in opt-out mode disables tracing", () => {
    const code = `
      // @trace-disable
      export default function Button() {
        return <div>Hello</div>;
      }
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: DEFAULT_CONFIG,
    };

    const result = transform(code, context);

    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
  });

  it("anonymous default export: @trace in opt-in mode enables tracing", () => {
    const code = `
      // @trace
      export default () => <div>Hello</div>;
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: { ...DEFAULT_CONFIG, mode: "opt-in" },
    };

    const result = transform(code, context);

    expect(result.injected).toBe(true);
    expect(result.components).toHaveLength(1);
    expect(result.components[0].name).toBe("Component_default");
  });

  it("memo-wrapped component: @trace in opt-in mode enables tracing", () => {
    const code = `
      // @trace
      const Button = memo(() => <div>Hello</div>);
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: { ...DEFAULT_CONFIG, mode: "opt-in" },
    };

    const result = transform(code, context);

    expect(result.injected).toBe(true);
    expect(result.components).toHaveLength(1);
    expect(result.components[0].name).toBe("Button");
  });

  it("memo-wrapped component: @trace-disable in opt-out mode disables tracing", () => {
    const code = `
      // @trace-disable
      const Button = memo(() => <div>Hello</div>);
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: DEFAULT_CONFIG,
    };

    const result = transform(code, context);

    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
  });

  it("forwardRef-wrapped component: @trace in opt-in mode enables tracing", () => {
    const code = `
      // @trace
      const Button = forwardRef((props, ref) => <div>Hello</div>);
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: { ...DEFAULT_CONFIG, mode: "opt-in" },
    };

    const result = transform(code, context);

    expect(result.injected).toBe(true);
    expect(result.components).toHaveLength(1);
    expect(result.components[0].name).toBe("Button");
  });

  it("forwardRef-wrapped component: @trace-disable in opt-out mode disables tracing", () => {
    const code = `
      // @trace-disable
      const Button = forwardRef((props, ref) => <div>Hello</div>);
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: DEFAULT_CONFIG,
    };

    const result = transform(code, context);

    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
  });

  it("nested HOC (memo + forwardRef): @trace in opt-in mode enables tracing", () => {
    const code = `
      // @trace
      const Button = memo(forwardRef((props, ref) => <div>Hello</div>));
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: { ...DEFAULT_CONFIG, mode: "opt-in" },
    };

    const result = transform(code, context);

    expect(result.injected).toBe(true);
    expect(result.components).toHaveLength(1);
    expect(result.components[0].name).toBe("Button");
  });

  it("nested HOC (memo + forwardRef): @trace-disable in opt-out mode disables tracing", () => {
    const code = `
      // @trace-disable
      const Button = memo(forwardRef((props, ref) => <div>Hello</div>));
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: DEFAULT_CONFIG,
    };

    const result = transform(code, context);

    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
  });
});

describe("Function-Level Pragma Support - Category 3: Exported HOC Host Shapes", () => {
  it("exported memo-wrapped component: @trace in opt-in mode enables tracing", () => {
    const code = `
      // @trace
      export const Button = memo(() => <div>Hello</div>);
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: { ...DEFAULT_CONFIG, mode: "opt-in" },
    };

    const result = transform(code, context);

    expect(result.injected).toBe(true);
    expect(result.components).toHaveLength(1);
    expect(result.components[0].name).toBe("Button");
  });

  it("exported memo-wrapped component: @trace-disable in opt-out mode disables tracing", () => {
    const code = `
      // @trace-disable
      export const Button = memo(() => <div>Hello</div>);
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: DEFAULT_CONFIG,
    };

    const result = transform(code, context);

    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
  });

  it("exported forwardRef-wrapped component: @trace in opt-in mode enables tracing", () => {
    const code = `
      // @trace
      export const Button = forwardRef((props, ref) => <div>Hello</div>);
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: { ...DEFAULT_CONFIG, mode: "opt-in" },
    };

    const result = transform(code, context);

    expect(result.injected).toBe(true);
    expect(result.components).toHaveLength(1);
    expect(result.components[0].name).toBe("Button");
  });

  it("exported forwardRef-wrapped component: @trace-disable in opt-out mode disables tracing", () => {
    const code = `
      // @trace-disable
      export const Button = forwardRef((props, ref) => <div>Hello</div>);
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: DEFAULT_CONFIG,
    };

    const result = transform(code, context);

    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
  });

  it("exported nested HOC (memo + forwardRef): @trace in opt-in mode enables tracing", () => {
    const code = `
      // @trace
      export const Button = memo(forwardRef((props, ref) => <div>Hello</div>));
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: { ...DEFAULT_CONFIG, mode: "opt-in" },
    };

    const result = transform(code, context);

    expect(result.injected).toBe(true);
    expect(result.components).toHaveLength(1);
    expect(result.components[0].name).toBe("Button");
  });

  it("exported nested HOC (memo + forwardRef): @trace-disable in opt-out mode disables tracing", () => {
    const code = `
      // @trace-disable
      export const Button = memo(forwardRef((props, ref) => <div>Hello</div>));
    `;
    const context: TransformContext = {
      filename: "Component.tsx",
      config: DEFAULT_CONFIG,
    };

    const result = transform(code, context);

    expect(result.injected).toBe(false);
    expect(result.components).toHaveLength(0);
  });
});
