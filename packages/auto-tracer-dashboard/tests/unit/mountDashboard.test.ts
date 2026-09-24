import { mountDashboard } from "@src/mountDashboard";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("mountDashboard", () => {
  it("should export mountDashboard function", () => {
    expect(mountDashboard).toBeDefined();
    expect(typeof mountDashboard).toBe("function");
  });

  describe("enabled flag", () => {
    beforeEach(() => {
      // Clean DOM and globalThis state between tests
      document.body.innerHTML = "";
      delete (globalThis as Record<string, unknown>).autoTracer;
      delete (globalThis as Record<string, unknown>).__autoTracerDashboardConfig;
    });

    afterEach(() => {
      document.body.innerHTML = "";
      delete (globalThis as Record<string, unknown>).autoTracer;
      delete (globalThis as Record<string, unknown>).__autoTracerDashboardConfig;
    });

    it("mounts the widget when enabled is omitted (default)", () => {
      mountDashboard();
      expect(document.getElementById("autotracer-dashboard-root")).not.toBeNull();
    });

    it("mounts the widget when enabled is true", () => {
      mountDashboard({ enabled: true });
      expect(document.getElementById("autotracer-dashboard-root")).not.toBeNull();
    });

    it("does not mount the widget when enabled is false", () => {
      mountDashboard({ enabled: false });
      expect(document.getElementById("autotracer-dashboard-root")).toBeNull();
    });

    it("does not register globalThis.autoTracer.widget when enabled is false", () => {
      mountDashboard({ enabled: false });
      expect((globalThis as Record<string, unknown>).autoTracer).toBeUndefined();
    });

    it("enabled: false via injected config does not mount the widget", () => {
      (globalThis as Record<string, unknown>).__autoTracerDashboardConfig = { enabled: false };
      mountDashboard();
      expect(document.getElementById("autotracer-dashboard-root")).toBeNull();
    });

    it("runtime enabled: false overrides injected enabled: true", () => {
      (globalThis as Record<string, unknown>).__autoTracerDashboardConfig = { enabled: true };
      mountDashboard({ enabled: false });
      expect(document.getElementById("autotracer-dashboard-root")).toBeNull();
    });
  });

  describe("hideByDefault default value", () => {
    beforeEach(() => {
      localStorage.clear();
      document.body.innerHTML = "";
      delete (globalThis as Record<string, unknown>).autoTracer;
      delete (globalThis as Record<string, unknown>).__autoTracerDashboardConfig;
    });

    afterEach(() => {
      document.body.innerHTML = "";
      delete (globalThis as Record<string, unknown>).autoTracer;
      delete (globalThis as Record<string, unknown>).__autoTracerDashboardConfig;
      localStorage.clear();
    });

    it("hides the widget by default when hideByDefault is not specified", () => {
      mountDashboard();
      const root = document.getElementById("autotracer-dashboard-root");
      expect(root).not.toBeNull();
      expect(root?.querySelector(".dashboard-hidden")).not.toBeNull();
    });

    it("shows the widget when hideByDefault is explicitly false", () => {
      mountDashboard({ hideByDefault: false });
      const root = document.getElementById("autotracer-dashboard-root");
      expect(root).not.toBeNull();
      expect(root?.querySelector(".dashboard-hidden")).toBeNull();
    });
  });

  describe("shared plugin mounting", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
      delete (globalThis as Record<string, unknown>).autoTracer;
      delete globalThis.__autoTracerDashboardControls;
      delete (globalThis as Record<string, unknown>).__autoTracerDashboardConfig;
    });

    afterEach(() => {
      globalThis.autoTracer?.widget?.unregisterHotkeys();
      document.body.innerHTML = "";
      delete (globalThis as Record<string, unknown>).autoTracer;
      delete globalThis.__autoTracerDashboardControls;
      delete (globalThis as Record<string, unknown>).__autoTracerDashboardConfig;
    });

    it("[NET-DASH-007] keeps mounting idempotent across tracer plugin requests", () => {
      mountDashboard({ hideByDefault: false });
      const firstRoot = document.getElementById("autotracer-dashboard-root");
      const firstControls = globalThis.autoTracer?.widget;

      mountDashboard({ hideByDefault: true });

      expect(document.querySelectorAll("#autotracer-dashboard-root").length).toBe(
        1,
      );
      expect(document.getElementById("autotracer-dashboard-root")).toBe(
        firstRoot,
      );
      expect(globalThis.autoTracer?.widget).toBe(firstControls);
      expect(firstRoot?.querySelectorAll(".autotracer-dashboard").length).toBe(
        1,
      );
    });

    it("keeps mounting idempotent when a tracer replaces the shared global", () => {
      mountDashboard({ hideByDefault: false });
      const root = document.getElementById("autotracer-dashboard-root");
      const firstControls = globalThis.autoTracer?.widget;

      delete (globalThis as Record<string, unknown>).autoTracer;
      mountDashboard({ hideByDefault: false });

      expect(root?.querySelectorAll(".autotracer-dashboard").length).toBe(1);
      expect(globalThis.autoTracer?.widget).toBe(firstControls);
      globalThis.autoTracer?.widget?.toggle();
      expect(root?.querySelector(".dashboard-hidden")).not.toBeNull();
    });
  });
});
