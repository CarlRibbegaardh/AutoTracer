import { describe, it, expect } from "vitest";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { callsReactHooks } from "../../../../../src/functions/detect/helpers/callsReactHooks";
import { hasJSXInBody } from "../../../../../src/functions/detect/helpers/hasJSXInBody";

// Fix for Babel traverse default export issues
const traverseDefault =
  typeof traverse === "function" ? traverse : (traverse as any).default;

/**
 * Test helper: Parse code and extract the first function node
 */
function parseFunction(code: string): t.Function {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });

  let func: t.Function | null = null;

  traverseDefault(ast, {
    Function(path: any) {
      if (!func) {
        func = path.node;
      }
      path.stop();
    },
  });

  if (!func) {
    throw new Error(`No function found in code: ${code}`);
  }

  return func;
}

describe("Nested function contamination prevention", () => {
  describe("callsReactHooks should NOT detect hooks in nested functions", () => {
    it("rejects wrapper with nested function that calls hooks", () => {
      const code = `
        function Wrapper() {
          function inner() {
            useState(0);
          }
          return null;
        }
      `;
      const func = parseFunction(code);

      // Should return false because hooks are only in nested function
      expect(callsReactHooks(func)).toBe(false);
    });

    it("rejects wrapper with nested arrow function that calls hooks", () => {
      const code = `
        function Wrapper() {
          const inner = () => {
            useState(0);
          };
          return null;
        }
      `;
      const func = parseFunction(code);

      expect(callsReactHooks(func)).toBe(false);
    });

    it("accepts component with direct hook call", () => {
      const code = `
        function Component() {
          const [state] = useState(0);
          return <div>{state}</div>;
        }
      `;
      const func = parseFunction(code);

      // Should return true because hook is called directly
      expect(callsReactHooks(func)).toBe(true);
    });

    it("accepts component with hook call even if nested function also calls hooks", () => {
      const code = `
        function Component() {
          const [state] = useState(0);

          function helper() {
            useEffect(() => {});
          }

          return <div>{state}</div>;
        }
      `;
      const func = parseFunction(code);

      // Should return true because outer function calls hook directly
      expect(callsReactHooks(func)).toBe(true);
    });

    it("rejects expression-bodied arrow with nested function hook call", () => {
      const code = `
        const wrapper = () => (() => useState(0));
      `;
      const func = parseFunction(code);

      // Nested arrow function calls hook, but outer does not
      expect(callsReactHooks(func)).toBe(false);
    });
  });

  describe("hasJSXInBody should NOT detect JSX in nested functions", () => {
    it("rejects utility with nested function that returns JSX", () => {
      const code = `
        function Utility() {
          const render = () => <div />;
          return 1;
        }
      `;
      const func = parseFunction(code);

      // Should return false because JSX is only in nested function
      expect(hasJSXInBody(func)).toBe(false);
    });

    it("rejects wrapper with nested arrow JSX function", () => {
      const code = `
        function Wrapper() {
          const element = () => <span>Text</span>;
          return null;
        }
      `;
      const func = parseFunction(code);

      expect(hasJSXInBody(func)).toBe(false);
    });

    it("accepts component with direct JSX return", () => {
      const code = `
        function Component() {
          return <div>Hello</div>;
        }
      `;
      const func = parseFunction(code);

      // Should return true because JSX is in direct body
      expect(hasJSXInBody(func)).toBe(true);
    });

    it("accepts component with JSX even if nested function also has JSX", () => {
      const code = `
        function Component() {
          const helper = () => <span />;
          return <div>Hello</div>;
        }
      `;
      const func = parseFunction(code);

      // Should return true because outer function has JSX directly
      expect(hasJSXInBody(func)).toBe(true);
    });

    it("rejects wrapper with only nested JSX in variable initializer", () => {
      const code = `
        function wrapper() {
          const Inner = () => <div />;
          return { component: Inner };
        }
      `;
      const func = parseFunction(code);

      // Nested component creation, but no JSX in outer function body
      expect(hasJSXInBody(func)).toBe(false);
    });
  });

  describe("Combined: prevents misclassification from nested implementation details", () => {
    it("does not treat factory returning component as a component", () => {
      const code = `
        function createComponent() {
          return function Inner() {
            const [state] = useState(0);
            return <div>{state}</div>;
          };
        }
      `;
      const func = parseFunction(code);

      // Outer function has no JSX or hooks directly
      expect(callsReactHooks(func)).toBe(false);
      expect(hasJSXInBody(func)).toBe(false);
    });

    it("does not treat HOC wrapper as component based on wrapped component", () => {
      const code = `
        function withFeature(Component) {
          return function Enhanced(props) {
            const [enhanced] = useState(true);
            return <Component {...props} enhanced={enhanced} />;
          };
        }
      `;
      const func = parseFunction(code);

      // Outer wrapper has no JSX or hooks directly
      expect(callsReactHooks(func)).toBe(false);
      expect(hasJSXInBody(func)).toBe(false);
    });
  });
});
