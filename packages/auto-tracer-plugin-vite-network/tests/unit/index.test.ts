import { afterEach, describe, expect, it } from "vitest";
import { networkTracer } from "../../src/index.js";

/** Invokes a Vite HTML hook and returns its bootstrap tags. */
async function invokeHtmlHook(plugin: ReturnType<typeof networkTracer.vite>) {
  const hook = plugin.transformIndexHtml;
  if (hook === undefined)
    throw new Error("Plugin has no transformIndexHtml hook");
  const handler = typeof hook === "function" ? hook : hook.handler;
  return Reflect.apply(handler, undefined, ["<html></html>"]);
}

/** Invokes the plugin's resolved-config hook with a Vite command. */
function resolvePluginConfig(
  plugin: ReturnType<typeof networkTracer.vite>,
  command: "build" | "serve",
): void {
  const hook = Reflect.get(plugin, "configResolved");
  if (typeof hook !== "function") {
    throw new Error("Plugin has no configResolved hook");
  }
  Reflect.apply(hook, plugin, [{ command }]);
}

describe("networkTracer Vite plugin", () => {
  afterEach(() => {
    delete process.env.TRACE_INJECT;
  });

  it("[NET-VITE-001..002] bootstraps NetworkTracer before the application without transforming source", async () => {
    const plugin = networkTracer.vite();

    expect(plugin.name).toBe("@autotracer/plugin-vite-network");
    expect(plugin.enforce).toBe("pre");
    expect(plugin.transform).toBeUndefined();
    expect(plugin.transformIndexHtml).toMatchObject({ order: "pre" });

    const tags = await invokeHtmlHook(plugin);
    expect(tags).toHaveLength(1);
    const bootstrap = tags[0];
    expect(bootstrap).toBeDefined();
    if (bootstrap === undefined) return;
    expect(bootstrap.children).toContain(
      'import { networkTracer } from "@autotracer/network";',
    );
    expect(bootstrap.children).toContain("networkTracer(");
    expect(bootstrap.injectTo).toBe("head-prepend");
  });

  it("[NET-VITE-003] injects the runtime by default", async () => {
    const tags = await invokeHtmlHook(networkTracer.vite());
    const bootstrap = tags[0];

    expect(bootstrap?.children).toContain("@autotracer/network");
  });

  it("[NET-VITE-004,006] emits no application output when inject is false", async () => {
    const plugin = Reflect.apply(networkTracer.vite, networkTracer, [
      { inject: false },
    ]);

    expect(plugin.name).toBe("@autotracer/plugin-vite-network");
    expect(await invokeHtmlHook(plugin)).toEqual([]);
  });

  it("[NET-VITE-005..006] emits no application output when TRACE_INJECT is zero", async () => {
    process.env.TRACE_INJECT = "0";
    const plugin = networkTracer.vite();

    expect(plugin.name).toBe("@autotracer/plugin-vite-network");
    expect(await invokeHtmlHook(plugin)).toEqual([]);
  });

  it("[NET-VITE-007] injects shared Dashboard configuration and mounting", async () => {
    const dashboardConfig = {
      enabled: true,
      hideByDefault: false,
      position: "bottom-left",
    };
    const plugin = Reflect.apply(networkTracer.vite, networkTracer, [
      { dashboardConfig },
    ]);

    const tags = await invokeHtmlHook(plugin);
    expect(tags.map((tag) => tag.injectTo)).toEqual([
      "head-prepend",
      "head-prepend",
      "head-prepend",
    ]);
    expect(tags[0]?.children).toBe(
      `globalThis.__autoTracerDashboardConfig = ${JSON.stringify(dashboardConfig)};`,
    );
    expect(tags[1]?.children).toBe(
      'import { mountDashboard } from "@autotracer/dashboard";\nmountDashboard();',
    );
    expect(tags[2]?.children).toContain("@autotracer/network");
  });

  it("versions Dashboard imports for each development server process", async () => {
    const plugin = networkTracer.vite({ dashboardConfig: {} });
    resolvePluginConfig(plugin, "serve");

    const tags = await invokeHtmlHook(plugin);
    const mountScript = tags.find((tag) =>
      tag.children.includes("mountDashboard"),
    );
    const repeatedTags = await invokeHtmlHook(plugin);
    const repeatedMountScript = repeatedTags.find((tag) =>
      tag.children.includes("mountDashboard"),
    );

    expect(mountScript?.children).toMatch(
      /@autotracer\/dashboard\?autotracer-dashboard=\d+-\d+/u,
    );
    expect(repeatedMountScript?.children).toBe(mountScript?.children);
  });

  it("keeps Dashboard imports stable for production builds", async () => {
    const plugin = networkTracer.vite({ dashboardConfig: {} });
    resolvePluginConfig(plugin, "build");

    const tags = await invokeHtmlHook(plugin);
    const mountScript = tags.find((tag) =>
      tag.children.includes("mountDashboard"),
    );

    expect(mountScript?.children).toContain(
      'from "@autotracer/dashboard"',
    );
    expect(mountScript?.children).not.toContain("?autotracer-dashboard=");
  });

  it("[NET-VITE-007] omits Dashboard output when its integration is disabled", async () => {
    const plugin = Reflect.apply(networkTracer.vite, networkTracer, [
      { dashboardConfig: { enabled: false } },
    ]);

    const tags = await invokeHtmlHook(plugin);
    expect(tags).toHaveLength(1);
    expect(tags[0]?.children).toContain("@autotracer/network");
  });

  it("[NET-VITE-008] passes project defaults to the runtime without handling persistence", async () => {
    const initializerDefaults = {
      captureRequestBody: true,
      bodyCaptureLimit: 2_048,
      includePatterns: ["/api/**"],
    };
    const plugin = Reflect.apply(networkTracer.vite, networkTracer, [
      { initializerDefaults },
    ]);

    const tags = await invokeHtmlHook(plugin);
    const bootstrap = tags[0]?.children;
    expect(bootstrap).toContain(
      `networkTracer(${JSON.stringify(initializerDefaults)});`,
    );
    expect(bootstrap).not.toContain("localStorage");
  });
});
