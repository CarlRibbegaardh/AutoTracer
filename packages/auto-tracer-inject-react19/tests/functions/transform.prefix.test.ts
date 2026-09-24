import { describe, it, expect } from "vitest";
import { transform } from "../../src/functions/transform/transform";
import type { TransformContext } from "../../src/interfaces/TransformContext";

/** Constructs a minimal TransformContext with prefix set. */
function makeContext(prefix?: string): TransformContext {
  return {
    filename: "src/MyComponent.tsx",
    config: {
      mode: "opt-out",
      importSource: "@autotracer/react18",
      include: { paths: ["src/**/*.tsx"] },
      exclude: { paths: [] },
      labelHooks: [],
      labelHooksPattern: "",
      serverComponents: false,
    },
    prefix,
  };
}

describe("transform – prefix", () => {
  it("injects bare component name when no prefix is configured", () => {
    const code = `
      export function Header() {
        return <div>hello</div>;
      }
    `;
    const result = transform(code, makeContext());
    expect(result.code).toContain('"Header"');
    expect(result.code).not.toContain('":");');
  });

  it("prepends prefix to component name when prefix is set", () => {
    const code = `
      export function Header() {
        return <div>hello</div>;
      }
    `;
    const result = transform(code, makeContext("Island"));
    expect(result.code).toContain('"Island:Header"');
    expect(result.code).not.toContain('"Header"');
  });

  it("applies prefix to FunctionDeclaration components", () => {
    const code = `
      export function Counter() {
        const [count, setCount] = useState(0);
        return <span>{count}</span>;
      }
    `;
    const result = transform(code, makeContext("Footer"));
    expect(result.code).toContain('"Footer:Counter"');
  });

  it("applies prefix to arrow function components (VariableDeclarator)", () => {
    const code = `
      export const Counter = () => {
        const [count, setCount] = useState(0);
        return <span>{count}</span>;
      };
    `;
    const result = transform(code, makeContext("Footer"));
    expect(result.code).toContain('"Footer:Counter"');
  });

  it("applies prefix to multiple components in the same file", () => {
    const code = `
      export function Alpha() {
        return <div />;
      }
      export function Beta() {
        return <div />;
      }
    `;
    const result = transform(code, makeContext("Sidebar"));
    expect(result.code).toContain('"Sidebar:Alpha"');
    expect(result.code).toContain('"Sidebar:Beta"');
  });

  it("empty-string prefix is treated as no prefix", () => {
    const code = `
      export function Card() {
        return <div />;
      }
    `;
    const result = transform(code, makeContext(""));
    expect(result.code).toContain('"Card"');
    expect(result.code).not.toContain('":");');
  });
});
