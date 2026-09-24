import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createFlowTracer } from "../../../src/lib/FlowTracer";
import { createRuntimeControl } from "../../../src/lib/RuntimeControl";
import { createLogger } from "../../../../auto-tracer-logger/src/lib/Logger";
import type { Logger } from "../../../../auto-tracer-logger/src/lib/Logger";

describe("RuntimeControl", () => {
  let logger: Logger;

  beforeEach(() => {
    logger = createLogger("test");
    logger.setLogLevel("trace");
  });

  afterEach(() => {
    // Clean up global properties
    delete globalThis.autoTracer;
  });

  describe("createRuntimeControl", () => {
    it("should create runtime control API", () => {
      createFlowTracer(logger);
      const api = createRuntimeControl(logger);

      expect(api).toHaveProperty("start");
      expect(api).toHaveProperty("stop");
      expect(api).toHaveProperty("isEnabled");
    });
  });
});
