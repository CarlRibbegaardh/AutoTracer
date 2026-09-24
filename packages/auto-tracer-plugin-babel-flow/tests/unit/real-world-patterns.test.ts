import { describe, it, expect } from "vitest";
import { transformSync } from "@babel/core";
import flowTracerBabelPlugin from "../../src/index";

/**
 * Helper to transform code using the plugin
 */
function transform(code: string, options = {}) {
  const result = transformSync(code, {
    plugins: [[flowTracerBabelPlugin, options]],
    filename: "test.ts",
    configFile: false,
    babelrc: false,
  });
  return result?.code ?? "";
}

describe("Real-World Patterns", () => {
  describe("Higher-Order Functions", () => {
    it("should handle function returning function", () => {
      const input = `
        function createMultiplier(factor) {
          return function multiply(value) {
            return value * factor;
          };
        }
      `;

      const output = transform(input);

      // Both outer and inner functions should be instrumented
      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("createMultiplier");
      expect(output).toContain("multiply");
    });

    it("should handle curried functions", () => {
      const input = `
        function curry(a) {
          return function(b) {
            return function(c) {
              return a + b + c;
            };
          };
        }
      `;

      const output = transform(input);

      // All three levels should be instrumented
      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("curry");
    });

    it("should handle partial application", () => {
      const input = `
        function partial(fn, ...args1) {
          return function(...args2) {
            return fn(...args1, ...args2);
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("__flowTracer.traceParameter");
      expect(output).toContain("...args1");
    });
  });

  describe("Function Composition", () => {
    it("should handle compose utility", () => {
      const input = `
        function compose(...fns) {
          return function(value) {
            return fns.reduceRight((acc, fn) => fn(acc), value);
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("compose");
      expect(output).toContain("reduceRight");
    });

    it("should handle pipe utility", () => {
      const input = `
        function pipe(...fns) {
          return function(value) {
            return fns.reduce((acc, fn) => fn(acc), value);
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("pipe");
    });

    it("should handle complex composition chain", () => {
      const input = `
        function processData(data) {
          const validate = (x) => x.length > 0 ? x : [];
          const transform = (x) => x.map(i => i * 2);
          const filter = (x) => x.filter(i => i > 5);

          return filter(transform(validate(data)));
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("processData");
    });
  });

  describe("Middleware Pattern", () => {
    it("should handle middleware factory", () => {
      const input = `
        function createMiddleware(options) {
          return function middleware(req, res, next) {
            if (options.enabled) {
              req.processed = true;
            }
            next();
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("createMiddleware");
      expect(output).toContain("middleware");
    });

    it("should handle middleware composition", () => {
      const input = `
        function composeMiddleware(...middlewares) {
          return function(req, res, final) {
            let index = 0;
            function next() {
              if (index < middlewares.length) {
                middlewares[index++](req, res, next);
              } else {
                final();
              }
            }
            next();
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("composeMiddleware");
      expect(output).toContain("next");
    });
  });

  describe("Memoization", () => {
    it("should handle basic memoization", () => {
      const input = `
        function memoize(fn) {
          const cache = new Map();
          return function(...args) {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
              return cache.get(key);
            }
            const result = fn(...args);
            cache.set(key, result);
            return result;
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("memoize");
      expect(output).toContain("cache");
    });

    it("should handle memoization with WeakMap", () => {
      const input = `
        function memoizeOne(fn) {
          const cache = new WeakMap();
          return function(obj, ...args) {
            if (cache.has(obj)) {
              return cache.get(obj);
            }
            const result = fn(obj, ...args);
            cache.set(obj, result);
            return result;
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("WeakMap");
    });
  });

  describe("Event Handlers", () => {
    it("should handle event listener factory", () => {
      const input = `
        function createClickHandler(action) {
          return function handleClick(event) {
            event.preventDefault();
            action(event.target.value);
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("createClickHandler");
      expect(output).toContain("handleClick");
    });

    it("should handle debounced handler", () => {
      const input = `
        function debounce(fn, delay) {
          let timeoutId;
          return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("debounce");
    });

    it("should handle throttled handler", () => {
      const input = `
        function throttle(fn, limit) {
          let inThrottle;
          return function(...args) {
            if (!inThrottle) {
              fn(...args);
              inThrottle = true;
              setTimeout(() => inThrottle = false, limit);
            }
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("throttle");
    });
  });

  describe("Factory Patterns", () => {
    it("should handle object factory", () => {
      const input = `
        function createUser(name, age) {
          return {
            name,
            age,
            greet() {
              return \`Hello, I'm \${this.name}\`;
            },
            birthday() {
              this.age++;
            }
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("createUser");
      expect(output).toContain("greet");
      expect(output).toContain("birthday");
    });

    it("should handle factory with private state", () => {
      const input = `
        function createCounter() {
          let count = 0;
          return {
            increment() {
              return ++count;
            },
            decrement() {
              return --count;
            },
            getCount() {
              return count;
            }
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("createCounter");
      expect(output).toContain("increment");
      expect(output).toContain("decrement");
      expect(output).toContain("getCount");
    });

    it("should handle builder pattern", () => {
      const input = `
        function createQueryBuilder() {
          let query = {};
          return {
            select(fields) {
              query.fields = fields;
              return this;
            },
            where(condition) {
              query.where = condition;
              return this;
            },
            build() {
              return query;
            }
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("createQueryBuilder");
      expect(output).toContain("select");
      expect(output).toContain("where");
      expect(output).toContain("build");
    });
  });

  describe("Async Patterns", () => {
    it("should handle async retry pattern", () => {
      const input = `
        async function retry(fn, maxAttempts) {
          for (let i = 0; i < maxAttempts; i++) {
            try {
              return await fn();
            } catch (error) {
              if (i === maxAttempts - 1) throw error;
            }
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("retry");
    });

    it("should handle async timeout pattern", () => {
      const input = `
        async function withTimeout(promise, ms) {
          const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), ms)
          );
          return Promise.race([promise, timeout]);
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("withTimeout");
      expect(output).toContain("Promise.race");
    });

    it("should handle async queue pattern", () => {
      const input = `
        function createAsyncQueue() {
          const queue = [];
          let processing = false;

          async function process() {
            if (processing || queue.length === 0) return;
            processing = true;
            const task = queue.shift();
            await task();
            processing = false;
            process();
          }

          return {
            add(task) {
              queue.push(task);
              process();
            }
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("createAsyncQueue");
      expect(output).toContain("process");
    });
  });

  describe("Functional Utilities", () => {
    it("should handle map implementation", () => {
      const input = `
        function map(fn, array) {
          const result = [];
          for (const item of array) {
            result.push(fn(item));
          }
          return result;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("map");
    });

    it("should handle filter implementation", () => {
      const input = `
        function filter(predicate, array) {
          const result = [];
          for (const item of array) {
            if (predicate(item)) {
              result.push(item);
            }
          }
          return result;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("filter");
    });

    it("should handle reduce implementation", () => {
      const input = `
        function reduce(reducer, initial, array) {
          let accumulator = initial;
          for (const item of array) {
            accumulator = reducer(accumulator, item);
          }
          return accumulator;
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("reduce");
    });
  });

  describe("State Management", () => {
    it("should handle state store pattern", () => {
      const input = `
        function createStore(initialState) {
          let state = initialState;
          const listeners = [];

          return {
            getState() {
              return state;
            },
            setState(newState) {
              state = newState;
              listeners.forEach(listener => listener(state));
            },
            subscribe(listener) {
              listeners.push(listener);
              return function unsubscribe() {
                const index = listeners.indexOf(listener);
                listeners.splice(index, 1);
              };
            }
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("createStore");
      expect(output).toContain("getState");
      expect(output).toContain("setState");
      expect(output).toContain("subscribe");
      expect(output).toContain("unsubscribe");
    });

    it("should handle reducer pattern", () => {
      const input = `
        function createReducer(initialState, handlers) {
          return function reducer(state = initialState, action) {
            if (handlers[action.type]) {
              return handlers[action.type](state, action);
            }
            return state;
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("createReducer");
      expect(output).toContain("reducer");
    });
  });

  describe("Dependency Injection", () => {
    it("should handle dependency injection container", () => {
      const input = `
        function createContainer() {
          const services = new Map();

          return {
            register(name, factory) {
              services.set(name, { factory, instance: null });
            },
            resolve(name) {
              const service = services.get(name);
              if (!service) throw new Error(\`Service \${name} not found\`);
              if (!service.instance) {
                service.instance = service.factory(this);
              }
              return service.instance;
            }
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("createContainer");
      expect(output).toContain("register");
      expect(output).toContain("resolve");
    });

    it("should handle service locator", () => {
      const input = `
        function createServiceLocator() {
          const services = {};

          return {
            set(key, value) {
              services[key] = value;
            },
            get(key) {
              if (!(key in services)) {
                throw new Error(\`Service '\${key}' not found\`);
              }
              return services[key];
            }
          };
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("createServiceLocator");
    });
  });

  describe("Error Handling Patterns", () => {
    it("should handle Result/Either pattern", () => {
      const input = `
        function trySafe(fn) {
          try {
            return { ok: true, value: fn() };
          } catch (error) {
            return { ok: false, error };
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("trySafe");
    });

    it("should handle async Result pattern", () => {
      const input = `
        async function tryAsync(fn) {
          try {
            const value = await fn();
            return { ok: true, value };
          } catch (error) {
            return { ok: false, error };
          }
        }
      `;

      const output = transform(input);

      expect(output).toContain("__flowTracer.enter");
      expect(output).toContain("tryAsync");
    });
  });
});
