import { describe, it, expect } from "vitest";
import { transformSync } from "@babel/core";
import flowTracerBabelPlugin from "../../src/index";

/**
 * Helper to transform code using the plugin
 */
function transform(code: string, options = {}) {
  const result = transformSync(code, {
    plugins: [[flowTracerBabelPlugin, options]],
    filename: "test.js",
    configFile: false,
    babelrc: false,
  });
  return result?.code ?? "";
}

describe("Parameter Instrumentation", () => {
  describe("simple parameters", () => {
    it("should instrument single parameter", () => {
      const input = `
        function greet(name) {
          return "Hello " + name;
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("name", name)');
      expect(output).toContain('__flowTracer.enter("greet")');
    });

    it("should instrument multiple parameters", () => {
      const input = `
        function add(a, b, c) {
          return a + b + c;
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("a", a)');
      expect(output).toContain('__flowTracer.traceParameter("b", b)');
      expect(output).toContain('__flowTracer.traceParameter("c", c)');
    });

    it("should instrument arrow function parameters", () => {
      const input = `
        const double = (x) => x * 2;
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("x", x)');
    });

    it("should instrument function expression parameters", () => {
      const input = `
        const fn = function(value) {
          return value;
        };
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("value", value)');
    });
  });

  describe("rest parameters", () => {
    it("should instrument rest parameter", () => {
      const input = `
        function sum(...numbers) {
          return numbers.reduce((a, b) => a + b, 0);
        }
      `;
      const output = transform(input);

      expect(output).toContain(
        '__flowTracer.traceParameter("...numbers", numbers)'
      );
    });

    it("should instrument rest parameter with other parameters", () => {
      const input = `
        function log(level, ...messages) {
          console.log(level, ...messages);
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("level", level)');
      expect(output).toContain(
        '__flowTracer.traceParameter("...messages", messages)'
      );
    });
  });

  describe("default parameters", () => {
    it("should instrument parameter with primitive default", () => {
      const input = `
        function greet(name = "World") {
          return "Hello " + name;
        }
      `;
      const output = transform(input);

      // Should trace the parameter after default is applied
      expect(output).toContain('__flowTracer.traceParameter("name", name)');
      expect(output).toContain('__flowTracer.enter("greet")');
    });

    it("should instrument parameter with expression default", () => {
      const input = `
        function configure(port = process.env.PORT || 3000) {
          return { port };
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("port", port)');
    });

    it("should instrument multiple parameters with defaults", () => {
      const input = `
        function create(name = "default", count = 1, enabled = true) {
          return { name, count, enabled };
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("name", name)');
      expect(output).toContain('__flowTracer.traceParameter("count", count)');
      expect(output).toContain(
        '__flowTracer.traceParameter("enabled", enabled)'
      );
    });

    it("should instrument mixed regular and default parameters", () => {
      const input = `
        function fetch(url, options = {}) {
          return { url, options };
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("url", url)');
      expect(output).toContain(
        '__flowTracer.traceParameter("options", options)'
      );
    });
  });

  describe("object destructuring parameters", () => {
    it("should instrument simple object destructuring", () => {
      const input = `
        function greet({ name, age }) {
          return \`\${name} is \${age}\`;
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("greet")');
      expect(output).toContain('__flowTracer.traceParameter("name", name)');
      expect(output).toContain('__flowTracer.traceParameter("age", age)');
    });

    it("should instrument object destructuring with defaults", () => {
      const input = `
        function configure({ host = "localhost", port = 3000 }) {
          return { host, port };
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("configure")');
      expect(output).toContain('__flowTracer.traceParameter("host", host)');
      expect(output).toContain('__flowTracer.traceParameter("port", port)');
    });

    it("should instrument object destructuring with renamed properties", () => {
      const input = `
        function process({ name: userName, id: userId }) {
          return { userName, userId };
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("process")');
      expect(output).toContain(
        '__flowTracer.traceParameter("userName", userName)'
      );
      expect(output).toContain('__flowTracer.traceParameter("userId", userId)');
    });

    it("should instrument nested object destructuring", () => {
      const input = `
        function extract({ user: { name, email } }) {
          return { name, email };
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("extract")');
      expect(output).toContain('__flowTracer.traceParameter("name", name)');
      expect(output).toContain('__flowTracer.traceParameter("email", email)');
    });

    it("should instrument object destructuring with rest", () => {
      const input = `
        function pick({ name, ...rest }) {
          return { name, rest };
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("pick")');
      expect(output).toContain('__flowTracer.traceParameter("name", name)');
      expect(output).toContain('__flowTracer.traceParameter("...rest", rest)');
    });
  });

  describe("array destructuring parameters", () => {
    it("should instrument simple array destructuring", () => {
      const input = `
        function sum([a, b]) {
          return a + b;
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("sum")');
      expect(output).toContain('__flowTracer.traceParameter("a", a)');
      expect(output).toContain('__flowTracer.traceParameter("b", b)');
    });

    it("should instrument array destructuring with defaults", () => {
      const input = `
        function point([x = 0, y = 0]) {
          return { x, y };
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("point")');
      expect(output).toContain('__flowTracer.traceParameter("x", x)');
      expect(output).toContain('__flowTracer.traceParameter("y", y)');
    });

    it("should instrument array destructuring with rest", () => {
      const input = `
        function first([head, ...tail]) {
          return { head, tail };
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("first")');
      expect(output).toContain('__flowTracer.traceParameter("head", head)');
      expect(output).toContain('__flowTracer.traceParameter("...tail", tail)');
    });

    it("should instrument nested array destructuring", () => {
      const input = `
        function matrix([[a, b], [c, d]]) {
          return a + b + c + d;
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("matrix")');
      expect(output).toContain('__flowTracer.traceParameter("a", a)');
      expect(output).toContain('__flowTracer.traceParameter("b", b)');
      expect(output).toContain('__flowTracer.traceParameter("c", c)');
      expect(output).toContain('__flowTracer.traceParameter("d", d)');
    });
  });

  describe("mixed parameter patterns", () => {
    it("should instrument mix of simple and rest parameters", () => {
      const input = `
        function log(level, category, ...messages) {
          console.log(level, category, ...messages);
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("level", level)');
      expect(output).toContain(
        '__flowTracer.traceParameter("category", category)'
      );
      expect(output).toContain(
        '__flowTracer.traceParameter("...messages", messages)'
      );
    });

    it("should instrument mix of destructuring and simple parameters", () => {
      const input = `
        function create(id, { name, age }) {
          return { id, name, age };
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("id", id)');
      expect(output).toContain('__flowTracer.enter("create")');
      expect(output).toContain('__flowTracer.traceParameter("name", name)');
      expect(output).toContain('__flowTracer.traceParameter("age", age)');
    });

    it("should instrument complex mixed patterns", () => {
      const input = `
        function handler(req, { headers = {}, body }, ...middleware) {
          return { req, headers, body, middleware };
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("req", req)');
      expect(output).toContain(
        '__flowTracer.traceParameter("headers", headers)'
      );
      expect(output).toContain('__flowTracer.traceParameter("body", body)');
      expect(output).toContain(
        '__flowTracer.traceParameter("...middleware", middleware)'
      );
    });
  });

  describe("edge cases", () => {
    it("should handle function with no parameters", () => {
      const input = `
        function noParams() {
          return 42;
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("noParams")');
      expect(output).not.toMatch(/traceParameter/);
    });

    it("should handle empty object destructuring", () => {
      const input = `
        function empty({}) {
          return true;
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("empty")');
    });

    it("should handle empty array destructuring", () => {
      const input = `
        function emptyArray([]) {
          return true;
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("emptyArray")');
    });

    it("should handle parameter with computed property in destructuring", () => {
      const input = `
        function dynamic({ [key]: value }) {
          return value;
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("dynamic")');
      // Computed properties are complex - may not be traceable
    });
  });

  describe("async function parameters", () => {
    it("should instrument async function parameters", () => {
      const input = `
        async function fetchData(url, options) {
          return await fetch(url, options);
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("url", url)');
      expect(output).toContain(
        '__flowTracer.traceParameter("options", options)'
      );
      expect(output).toContain('__flowTracer.enterAsync("fetchData")');
    });

    it("should instrument async arrow function parameters", () => {
      const input = `
        const load = async (id) => {
          return await getData(id);
        };
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("id", id)');
      expect(output).toContain('__flowTracer.enterAsync("load")');
    });
  });

  describe("class method parameters", () => {
    it("should instrument class method parameters", () => {
      const input = `
        class Calculator {
          add(a, b) {
            return a + b;
          }
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("a", a)');
      expect(output).toContain('__flowTracer.traceParameter("b", b)');
    });

    it("should instrument static method parameters", () => {
      const input = `
        class Utils {
          static parse(value) {
            return JSON.parse(value);
          }
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("value", value)');
    });

    it("should instrument constructor parameters", () => {
      const input = `
        class Person {
          constructor(name, age) {
            this.name = name;
            this.age = age;
          }
        }
      `;
      const output = transform(input);

      // Constructors ARE instrumented
      expect(output).toContain('__flowTracer.enter("constructor")');
      expect(output).toContain('__flowTracer.traceParameter("name"');
      expect(output).toContain('__flowTracer.traceParameter("age"');
    });

    it("should instrument getter with no parameters", () => {
      const input = `
        class User {
          get fullName() {
            return this.firstName + " " + this.lastName;
          }
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.enter("fullName")');
      expect(output).not.toMatch(/traceParameter/);
    });

    it("should instrument setter parameter", () => {
      const input = `
        class User {
          set name(value) {
            this._name = value;
          }
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("value", value)');
    });
  });

  describe("generator function parameters", () => {
    it("should instrument generator function parameters", () => {
      const input = `
        function* range(start, end) {
          for (let i = start; i < end; i++) {
            yield i;
          }
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("start", start)');
      expect(output).toContain('__flowTracer.traceParameter("end", end)');
    });

    it("should instrument async generator parameters", () => {
      const input = `
        async function* fetchPages(url) {
          let page = 1;
          while (true) {
            yield await fetch(\`\${url}?page=\${page++}\`);
          }
        }
      `;
      const output = transform(input);

      expect(output).toContain('__flowTracer.traceParameter("url", url)');
    });
  });
});
