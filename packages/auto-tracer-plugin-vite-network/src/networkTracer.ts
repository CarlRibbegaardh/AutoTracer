import type { NetworkTracerVitePlugin } from "./NetworkTracerVitePlugin.js";
import type { NetworkTracerViteOptions } from "./NetworkTracerViteOptions.js";

/**
 * Exposes the NetworkTracer Vite integration.
 */
export const networkTracer = {
  /**
   * Creates a Vite-compatible plugin that initializes NetworkTracer before the application entry point.
   *
   * @param options - NetworkTracer bootstrap options.
   * @returns A Vite plugin that prepends the NetworkTracer runtime bootstrap.
   */
  vite(options: NetworkTracerViteOptions = {}): NetworkTracerVitePlugin {
    let dashboardImportSpecifier = "@autotracer/dashboard";

    return {
      name: "@autotracer/plugin-vite-network",
      enforce: "pre",
      configResolved: (config) => {
        dashboardImportSpecifier =
          config.command === "serve"
            ? `@autotracer/dashboard?autotracer-dashboard=${process.pid}-${Math.trunc(performance.timeOrigin)}`
            : "@autotracer/dashboard";
      },
      transformIndexHtml: {
        order: "pre",
        handler: (_html) => {
          if (options.inject === false || process.env.TRACE_INJECT === "0") {
            return [];
          }
          const tags = [];
          if (
            options.dashboardConfig !== undefined &&
            options.dashboardConfig.enabled !== false
          ) {
            tags.push({
              tag: "script" as const,
              children: `globalThis.__autoTracerDashboardConfig = ${JSON.stringify(options.dashboardConfig)};`,
              injectTo: "head-prepend" as const,
            });
            tags.push({
              tag: "script" as const,
              attrs: { type: "module" as const },
              children: `import { mountDashboard } from ${JSON.stringify(dashboardImportSpecifier)};\nmountDashboard();`,
              injectTo: "head-prepend" as const,
            });
          }
          tags.push({
            tag: "script" as const,
            attrs: { type: "module" as const },
            children:
              'import { networkTracer } from "@autotracer/network";\n' +
              `networkTracer(${JSON.stringify(options.initializerDefaults ?? {})});`,
            injectTo: "head-prepend" as const,
          });
          return tags;
        },
      },
    };
  },
} as const;
