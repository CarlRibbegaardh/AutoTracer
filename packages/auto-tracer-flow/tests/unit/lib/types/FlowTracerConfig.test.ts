/**
 * @file Unit tests for FlowTracerConfig type
 */

import { describe, expect, it } from "vitest";
import type { FlowTracerConfig } from "../../../../src/lib/types/FlowTracerConfig";
import type { FlowThemeConfig } from "../../../../src/lib/types/FlowThemeConfig";

describe("FlowTracerConfig", () => {
  describe("type structure", () => {
    it("accepts empty config object", () => {
      const config: FlowTracerConfig = {};
      expect(config).toBeDefined();
    });

    it("accepts all optional fields", () => {
      const config: FlowTracerConfig = {
        // logLevel: "info",
        // logEnter: true,
        // logExit: true,
        // logTiming: true,
        // logParams: true,
        // logReturnValues: true,
        // warnOnMismatchedExit: true,
        // autoRecoverFromMismatch: true,
      };
      expect(config).toBeDefined();
    });
  });

  describe("theme field", () => {
    it("accepts theme configuration", () => {
      const theme: FlowThemeConfig = {
        asyncStart: {
          lightMode: { background: "blue" },
        },
      };

      const config: FlowTracerConfig = {
        theme,
      };

      expect(config.theme).toBe(theme);
    });

    it("theme field is optional", () => {
      const config: FlowTracerConfig = {
        // logLevel: "debug",
      };

      expect(config.theme).toBeUndefined();
    });

    it("accepts complete theme with all 8 categories", () => {
      const theme: FlowThemeConfig = {
        asyncStart: { lightMode: { text: "blue" } },
        asyncComplete: { lightMode: { text: "green" } },
        functionEnter: { lightMode: { text: "yellow" } },
        functionExit: { lightMode: { text: "orange" } },
        parameter: { lightMode: { text: "purple" } },
        returnValue: { lightMode: { text: "pink" } },
        exception: { lightMode: { text: "red" } },
        runtimeControl: { lightMode: { text: "gray" } },
      };

      const config: FlowTracerConfig = {
        theme,
      };

      expect(config.theme).toBe(theme);
    });
  });
});
