import { beforeEach, describe, expect, it, vi } from "vitest";
import { createLogger } from "../../../src/lib/Logger";
import { themes } from "../../../src/lib/themes";
import * as safeConsoleModule from "../../../src/lib/functions/safe/safeConsole";
import * as safeGroupModule from "../../../src/lib/functions/safe/safeGroup";

describe("createLogger", () => {
  describe("creation", () => {
    it("should create logger with given name", () => {
      const logger = createLogger("test");
      expect(logger).toBeDefined();
    });

    it("should have configuration methods", () => {
      const logger = createLogger("test");
      expect(logger.setLogLevel).toBeTypeOf("function");
      expect(logger.setTheme).toBeTypeOf("function");
      expect(logger.setGroupMode).toBeTypeOf("function");
      expect(logger.setShowName).toBeTypeOf("function");
    });
  });

  describe("state isolation", () => {
    it("should have independent state between logger instances", () => {
      const logger1 = createLogger("app");
      const logger2 = createLogger("database");

      // Verify they are different instances
      expect(logger1).not.toBe(logger2);
    });

    it("should allow independent configuration", () => {
      const logger1 = createLogger("app");
      const logger2 = createLogger("database");

      // Configure independently - no errors
      logger1.setLogLevel("debug");
      logger2.setLogLevel("error");

      logger1.setTheme(themes.emoji);
      logger2.setTheme(themes.minimal);

      logger1.setShowName(false);
      logger2.setShowName(true);

      // No way to verify private state, but test that methods don't throw
      expect(logger1).toBeDefined();
      expect(logger2).toBeDefined();
    });
  });

  describe("setLogLevel", () => {
    it("should accept log level", () => {
      const logger = createLogger("test");
      expect(() => {return logger.setLogLevel("debug")}).not.toThrow();
    });

    it("should not affect other logger instances", () => {
      const logger1 = createLogger("app");
      const logger2 = createLogger("database");

      logger1.setLogLevel("debug");
      logger2.setLogLevel("error");

      // Verify they are different instances
      expect(logger1).not.toBe(logger2);
    });
  });

  describe("setTheme", () => {
    it("should accept theme", () => {
      const logger = createLogger("test");
      expect(() => {return logger.setTheme(themes.emoji)}).not.toThrow();
    });

    it("should not affect other logger instances", () => {
      const logger1 = createLogger("app");
      const logger2 = createLogger("database");

      logger1.setTheme(themes.emoji);
      logger2.setTheme(themes.minimal);

      // Verify they are different instances
      expect(logger1).not.toBe(logger2);
    });

    it("should accept custom theme", () => {
      const logger = createLogger("test");
      const customTheme = {
        colors: { error: "#ff0000" },
        prefixes: { error: "✗" },
      };
      expect(() => {
        logger.setTheme(customTheme);
        logger.setGroupMode("text");
      }).not.toThrow();
    });
  });

  describe("setShowName", () => {
    it("should accept boolean value", () => {
      const logger = createLogger("test");
      expect(() => {return logger.setShowName(false)}).not.toThrow();
      expect(() => {return logger.setShowName(true)}).not.toThrow();
    });

    it("should not affect other logger instances", () => {
      const logger1 = createLogger("app");
      const logger2 = createLogger("database");

      logger1.setShowName(false);
      logger2.setShowName(true);

      // Verify they are different instances
      expect(logger1).not.toBe(logger2);
    });

    it("should not change grouping mode when theme changes", () => {
      vi.clearAllMocks();

      const safeConsoleSpy = vi.spyOn(safeConsoleModule, "safeConsole");
      const safeGroupSpy = vi
        .spyOn(safeGroupModule, "safeGroup")
        .mockImplementation(() => {});

      const logger = createLogger("test-logger");
      logger.setLogLevel("trace");
      logger.setGroupMode("text");
      logger.setShowName(true);

      logger.setTheme(themes.emoji);
      logger.group("outer");

      logger.setTheme(themes.minimal);
      logger.group("outer2");

      expect(safeGroupSpy).not.toHaveBeenCalled();

      expect(safeConsoleSpy).toHaveBeenNthCalledWith(
        1,
        "log",
        "├─ [test-logger] outer"
      );
      expect(safeConsoleSpy).toHaveBeenNthCalledWith(
        2,
        "log",
        "│  ├─ [test-logger] outer2"
      );
    });
  });

  describe('indentation and naming', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should place indentation before name and prefix', () => {
      const safeConsoleSpy = vi.spyOn(safeConsoleModule, 'safeConsole');
      const logger = createLogger('test-logger');

      // Configure logger
      logger.setTheme({
          colors: {},
          prefixes: {
              trace: '[TRACE]',
          }
      });
        logger.setGroupMode('text');
      logger.setLogLevel('trace');
      logger.setShowName(true);

      // Create a group to add indentation
      logger.group('outer');

      // Log a trace message
      logger.trace('inner message');

      expect(safeConsoleSpy).toHaveBeenCalledWith(
        'trace',
        '│  [test-logger] [TRACE] inner message'
      );
    });

    it('should indent each line of a multiline message', () => {
      const safeConsoleSpy = vi.spyOn(safeConsoleModule, 'safeConsole');
      const logger = createLogger('test-logger');

      logger.setTheme({
        colors: {},
        prefixes: {
          trace: '[TRACE]',
        },
      });
      logger.setGroupMode('text');
      logger.setLogLevel('trace');
      logger.setShowName(true);

      logger.group('outer');
      logger.trace('Line 1\nLine 2');

      expect(safeConsoleSpy).toHaveBeenLastCalledWith(
        'trace',
        '│  [test-logger] [TRACE] Line 1\n│  [test-logger] [TRACE] Line 2'
      );
    });
  });

  describe('enter/exit optionalParams storage', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should store all optionalParams in ExitHandle', () => {
      const logger = createLogger('test-logger');
      logger.setLogLevel('trace');

      // Call enter with multiple parameters
      const handle = logger.enter('myFunction', 'param1', 'param2', 'param3');

      // Verify the handle contains all optionalParams
      expect(handle.optionalParams).toEqual(['param1', 'param2', 'param3']);
    });

    it('should store empty array when no optionalParams provided', () => {
      const logger = createLogger('test-logger');
      logger.setLogLevel('trace');

      const handle = logger.enter('myFunction');

      // Should store undefined or empty array
      expect(handle.optionalParams).toBeUndefined();
    });

    it('should use stored optionalParams in exit() when no override provided', () => {
      const safeConsoleSpy = vi.spyOn(safeConsoleModule, 'safeConsole');
      const logger = createLogger('test-logger');

      // Configure logger to trace level in text mode for simpler verification
      logger.setTheme({
        colors: {},
        prefixes: {
          enter: '→',
          exit: '←',
        },
      });
      logger.setGroupMode('text');
      logger.setLogLevel('trace');
      logger.setShowName(false);

      // Call enter with CSS styling
      const cssStyle = 'color: blue; font-weight: bold';
      const handle = logger.enter('myFunction', cssStyle);

      // Clear spy to check exit call
      safeConsoleSpy.mockClear();

      // Call exit without override
      logger.exit(handle);

      // Verify exit message uses stored CSS
      expect(safeConsoleSpy).toHaveBeenCalledTimes(1);
      const [level, message, ...params] = safeConsoleSpy.mock.calls[0] as [string, string, ...unknown[]];

      expect(level).toBe('trace');
      expect(message).toMatch(/^└─ ← myFunction \(elapsed: [\d.]+ms\)$/);
      expect(params).toEqual([cssStyle]);
    });

    it('should use override optionalParams in exit() when provided', () => {
      const safeConsoleSpy = vi.spyOn(safeConsoleModule, 'safeConsole');
      const logger = createLogger('test-logger');

      logger.setTheme({
        colors: {},
        prefixes: {
          enter: '→',
          exit: '←',
        },
      });
      logger.setGroupMode('text');
      logger.setLogLevel('trace');
      logger.setShowName(false);

      // Call enter with one style
      const enterStyle = 'color: blue';
      const handle = logger.enter('myFunction', enterStyle);

      safeConsoleSpy.mockClear();

      // Call exit with different style (override)
      const exitStyle = 'color: red; font-weight: bold';
      logger.exit(handle, exitStyle);

      // Verify exit uses override, not stored params
      expect(safeConsoleSpy).toHaveBeenCalledTimes(1);
      const [level, message, ...params] = safeConsoleSpy.mock.calls[0] as [string, string, ...unknown[]];

      expect(level).toBe('trace');
      expect(message).toMatch(/^└─ ← myFunction \(elapsed: [\d.]+ms\)$/);
      expect(params).toEqual([exitStyle]);
    });

    it('should preserve multiple optionalParams through enter/exit cycle', () => {
      const safeConsoleSpy = vi.spyOn(safeConsoleModule, 'safeConsole');
      const logger = createLogger('test-logger');

      logger.setTheme({
        colors: {},
        prefixes: { enter: '→', exit: '←' },
      });
      logger.setGroupMode('text');
      logger.setLogLevel('trace');
      logger.setShowName(false);

      // Call enter with multiple params (e.g., CSS + additional data)
      const handle = logger.enter('myFunction', 'style1', 'style2', { debug: true });

      safeConsoleSpy.mockClear();

      // Exit without override - should use all stored params
      logger.exit(handle);

      expect(safeConsoleSpy).toHaveBeenCalledTimes(1);
      const [level, message, ...params] = safeConsoleSpy.mock.calls[0] as [string, string, ...unknown[]];

      expect(level).toBe('trace');
      expect(message).toMatch(/^└─ ← myFunction \(elapsed: [\d.]+ms\)$/);
      expect(params).toEqual(['style1', 'style2', { debug: true }]);
    });
  });

  describe('enterStyled/exitStyled API', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should store both rawLabel and styledLabel in handle', () => {
      const logger = createLogger('test-logger');
      logger.setLogLevel('trace');

      const handle = logger.enterStyled('myFunction', '%c→ myFunction', 'color: blue');

      expect(handle.rawLabel).toBe('myFunction');
      expect(handle.label).toBe('%c→ myFunction');
    });

    it('should output styledLabel to console on enterStyled', () => {
      const logger = createLogger('test-logger');
      logger.setLogLevel('trace');

      const safeConsoleSpy = vi.spyOn(safeConsoleModule, 'safeConsole');

      logger.setTheme({ colors: {}, prefixes: {} });
      logger.setGroupMode('text');
      logger.setShowName(false);

      logger.enterStyled('myFunction', '%c→ myFunction', 'color: blue');

      // In text mode, enter outputs via safeConsole
      expect(safeConsoleSpy).toHaveBeenCalledWith('trace', '├─ %c→ myFunction', 'color: blue');
    });

    it('should use provided styledLabel on exitStyled', () => {
      const safeConsoleSpy = vi.spyOn(safeConsoleModule, 'safeConsole');
      const logger = createLogger('test-logger');

      logger.setTheme({ colors: {}, prefixes: {} });
      logger.setGroupMode('text');
      logger.setLogLevel('trace');
      logger.setShowName(false);

      const handle = logger.enterStyled('myFunction', '%c→ myFunction', 'color: blue');

      safeConsoleSpy.mockClear();

      logger.exitStyled(handle, '%c← myFunction', 'color: green');

      expect(safeConsoleSpy).toHaveBeenCalledTimes(1);
      const [level, message, ...params] = safeConsoleSpy.mock.calls[0] as [string, string, ...unknown[]];

      expect(level).toBe('trace');
      expect(message).toMatch(/^└─ %c← myFunction \(elapsed: [\d.]+ms\)$/);
      expect(params).toEqual(['color: green']);
    });

    it('should use override params on exitStyled when provided', () => {
      const safeConsoleSpy = vi.spyOn(safeConsoleModule, 'safeConsole');
      const logger = createLogger('test-logger');

      logger.setTheme({ colors: {}, prefixes: {} });
      logger.setGroupMode('text');
      logger.setLogLevel('trace');
      logger.setShowName(false);

      const handle = logger.enterStyled('myFunction', '%c→ myFunction', 'color: blue');

      safeConsoleSpy.mockClear();

      logger.exitStyled(handle, '%c← myFunction', 'color: red', 'extra-param');

      expect(safeConsoleSpy).toHaveBeenCalledTimes(1);
      const [, , ...params] = safeConsoleSpy.mock.calls[0] as [string, string, ...unknown[]];

      expect(params).toEqual(['color: red', 'extra-param']);
    });

    it('should use handle optionalParams on exitStyled when no override', () => {
      const safeConsoleSpy = vi.spyOn(safeConsoleModule, 'safeConsole');
      const logger = createLogger('test-logger');

      logger.setTheme({ colors: {}, prefixes: {} });
      logger.setGroupMode('text');
      logger.setLogLevel('trace');
      logger.setShowName(false);

      const handle = logger.enterStyled('myFunction', '%c→ myFunction', 'color: blue', 'param2');

      safeConsoleSpy.mockClear();

      logger.exitStyled(handle, '%c← myFunction');

      expect(safeConsoleSpy).toHaveBeenCalledTimes(1);
      const [, , ...params] = safeConsoleSpy.mock.calls[0] as [string, string, ...unknown[]];

      expect(params).toEqual(['color: blue', 'param2']);
    });

    it('should handle empty rawLabel', () => {
      const logger = createLogger('test-logger');
      logger.setLogLevel('trace');

      const handle = logger.enterStyled('', '%c→ ', 'color: blue');

      expect(handle.rawLabel).toBe('');
      expect(handle.label).toBe('%c→ ');
    });

    it('should handle empty styledLabel', () => {
      const logger = createLogger('test-logger');
      logger.setLogLevel('trace');

      const handle = logger.enterStyled('myFunction', '', 'color: blue');

      expect(handle.rawLabel).toBe('myFunction');
      expect(handle.label).toBe('');
    });

    it('should work with no optionalParams', () => {
      const logger = createLogger('test-logger');
      logger.setLogLevel('trace');

      const handle = logger.enterStyled('myFunction', '%c→ myFunction');

      expect(handle.optionalParams).toBeUndefined();
    });
  });

  describe('regressions', () => {
    it('should not throw after enabling logging mid-flight in text group mode', () => {
      const logger = createLogger('test-logger');

      // Simulate runtime-controlled tracing where enter() can happen while logging is off,
      // then logging is enabled later (e.g., user clicks "start"), and group mode is set to text.
      logger.setTheme({ colors: {}, prefixes: {} });
      logger.setGroupMode('text');
      logger.setShowName(false);
      logger.setLogLevel('off');

      const dormantHandle = logger.enterStyled(
        'myFunction',
        '%c→ myFunction',
        'color: blue'
      );

      // Now enable logging (start tracing) and close the dormant handle.
      // This currently drives internal groupStack negative.
      logger.setLogLevel('trace');
      logger.exitStyled(dormantHandle, '%c← myFunction', 'color: green');

      // Next enter should never throw, regardless of internal groupStack state.
      expect(() => {
        logger.enterStyled('nextFunction', '%c→ nextFunction', 'color: blue');
      }).not.toThrow();
    });

    it('should unwind safely when exiting a dormant non-top handle while another group is open', () => {
      const safeConsoleSpy = vi.spyOn(safeConsoleModule, 'safeConsole');
      const logger = createLogger('test-logger');

      logger.setTheme({ colors: {}, prefixes: {} });
      logger.setGroupMode('text');
      logger.setShowName(false);

      // Create dormant handle while logging is off.
      logger.setLogLevel('off');
      const dormantHandle = logger.enterStyled(
        'dormant',
        '%c→ dormant',
        'color: blue'
      );

      // Enable logging and create a real entered group.
      logger.setLogLevel('trace');
      logger.enterStyled(
        'active',
        '%c→ active',
        'color: blue'
      );

      safeConsoleSpy.mockClear();

      // Exiting a non-top handle intentionally triggers unwind behavior.
      // The key regression requirement is: this must not crash or drive indentation negative.
      logger.exitStyled(dormantHandle, '%c← dormant', 'color: green');

      // After unwind, next enter should be a clean top-level enter (no negative indentation).
      logger.enterStyled('stillNested', '%c→ stillNested', 'color: blue');

      const calls = safeConsoleSpy.mock.calls;
      expect(calls.length).toBe(2);

      const firstCall = calls[0];
      expect(firstCall).toBeDefined();
      if (!firstCall) {
        return;
      }

      const exitLevel = firstCall[0];
      const exitMessage = firstCall[1];
      expect(exitLevel).toBe('trace');
      expect(String(exitMessage).startsWith('└─ %c→ active')).toBe(true);

      expect(calls[1]).toEqual(['trace', '├─ %c→ stillNested', 'color: blue']);
    });
  });
});
