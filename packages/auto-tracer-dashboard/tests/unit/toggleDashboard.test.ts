import { toggleDashboard } from "@src/toggleDashboard";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

/** Verifies the public dashboard visibility command. */
describe("toggleDashboard", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    delete (globalThis as Record<string, unknown>).autoTracer;
    delete globalThis.__autoTracerDashboardControls;
    delete globalThis.__autoTracerDashboardConfig;
  });

  afterEach(() => {
    globalThis.autoTracer?.widget?.unregisterHotkeys();
    document.body.innerHTML = "";
    delete (globalThis as Record<string, unknown>).autoTracer;
    delete globalThis.__autoTracerDashboardControls;
    delete globalThis.__autoTracerDashboardConfig;
  });

  it("restores replaced controls before toggling the mounted widget", () => {
    toggleDashboard();
    const root = document.getElementById("autotracer-dashboard-root");
    expect(root?.querySelector(".dashboard-hidden")).toBeNull();

    delete (globalThis as Record<string, unknown>).autoTracer;
    toggleDashboard();

    expect(globalThis.autoTracer?.widget).toBeDefined();
    expect(root?.querySelector(".dashboard-hidden")).not.toBeNull();
  });
});
