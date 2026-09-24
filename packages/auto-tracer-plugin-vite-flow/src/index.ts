import type { Plugin } from "vite";
import type { BabelPluginFlowConfig } from "@autotracer/plugin-babel-flow";
import type { BabelFlowModule } from "./BabelFlowModule.js";
import { createRequire } from "node:module";
import { loadThemeFiles } from "@autotracer/flow/build-utils";
import type { FlowThemeConfig } from "@autotracer/flow";

/**
 * Dashboard widget configuration.
 * Requires @autotracer/dashboard to be installed explicitly.
 *
 * When enabled, the dashboard package provides runtime control defaults.
 * See: https://github.com/CarlRibbegaardh/AutoTracer/tree/main/packages/auto-tracer-dashboard
 */
interface DashboardConfig {
  /**
   * Enable the dashboard widget.
   * @default true (when dashboardConfig is provided)
   */
  enabled?: boolean;

  /**
   * Start with the dashboard hidden (toggle with hotkey).
   * @default false
   */
  hideByDefault?: boolean;

  /**
   * Screen position for the dashboard widget.
   * @default 'bottom-right'
   */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";

  /**
   * Keyboard shortcuts for dashboard controls.
   */
  hotkeys?: {
    /**
     * Hotkey to toggle tracing on/off.
     * @default 'Alt+Shift+T'
     */
    toggleTracing?: string;

    /**
     * Hotkey to show/hide the dashboard.
     * @default 'Alt+Shift+D'
     */
    toggleDashboard?: string;
  };
}

// Create require function for loading CJS modules in ESM context
const require = createRequire(import.meta.url);

// Load babel flow module once at module level to access normalizeConfig and shouldProcessFile
const babelFlowModule =
  require("@autotracer/plugin-babel-flow") as BabelFlowModule;

/**
 * Vite plugin options for flow tracing.
 * Extends Babel plugin config with Vite-specific options.
 */
export interface FlowTracerViteOptions extends Partial<BabelPluginFlowConfig> {
  /**
   * Enable code injection. When false, the plugin is effectively disabled.
   * Use this to conditionally enable injection based on environment.
   * @default true
   */
  inject?: boolean;

  /**
   * Inject code in dormant mode — tracing disabled by default.
   * Activate at runtime via `globalThis.autoTracer.flowTracer.start()`.
   * Perfect for QA environments or production debugging.
   * @default true
   */
  runtimeControlled?: boolean;

  /**
   * Dashboard widget configuration.
   * Enables runtime controls via hotkeys and an in-app overlay.
   *
   * @default undefined (dashboard not loaded)
   *
   * @example
   * ```ts
   * flowTracer({
   *   dashboardConfig: {
   *     enabled: true,
   *     hideByDefault: false,
   *     position: 'bottom-right',
   *     hotkeys: {
   *       toggleTracing: 'Alt+Shift+T',
   *       toggleDashboard: 'Alt+Shift+D'
   *     }
   *   }
   * })
   * ```
   */
  dashboardConfig?: Partial<DashboardConfig>;

  /**
   * Sets the canonical AutoTracer output mode at startup.
   *
   * This is injected into the page before any tracer runtime modules load,
   * so format/grouping behavior is correct from the first trace.
   *
   * @default undefined (not set - uses runtime default)
   *
   * @example
   * outputMode: 'devtools' // Interactive console groups
   *
   * @example
   * outputMode: 'copy-paste' // Text-based output for sharing
   */
  outputMode?: "devtools" | "copy-paste";
}

/**
 * Vite plugin for automatic function flow tracing.
 * Applies Babel transformation to inject try/catch/finally blocks.
 *
 * @param options - Plugin configuration
 * @returns Vite plugin
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import { flowTracer } from '@autotracer/plugin-vite-flow';
 *
 * export default defineConfig({
 *   plugins: [
 *     flowTracer({
 *       logExceptions: true,
 *       exceptionLogLevel: 'debug'
 *     })
 *   ]
 * });
 * ```
 */
export function flowTracer(options: FlowTracerViteOptions = {}): Plugin {
  const normalizedConfig = babelFlowModule.normalizeConfig(options);
  const enabled = options.inject ?? true;
  const runtimeControlled = options.runtimeControlled ?? true;
  const outputMode = options.outputMode;
  const dashboardConfig = options.dashboardConfig;
  let dashboardImportSpecifier = "@autotracer/dashboard";

  const injectToHeadPrepend: "head-prepend" = "head-prepend";
  const injectToBodyPrepend: "body-prepend" = "body-prepend";

  // Load theme files at plugin initialization (build time)
  let themeConfig: Partial<FlowThemeConfig> = {};

  /**
   * Warning sink for plugin diagnostics.
   * Assigned in configResolved when Vite's logger is available.
   *
   * Side effects: may write to the console in non-Vite contexts (e.g., unit tests).
   */
  let warn: (message: string) => void = (message: string): void => {
    console.warn(message);
  };

  return {
    name: "@autotracer/plugin-vite-flow",
    enforce: "pre", // Run before other transformations

    async configResolved(config) {
      dashboardImportSpecifier =
        config.command === "serve"
          ? `@autotracer/dashboard?autotracer-dashboard=${process.pid}-${Math.trunc(performance.timeOrigin)}`
          : "@autotracer/dashboard";
      warn = (message: string): void => {
        config.logger.warn(message);
      };

      // Load theme files from project root at build time
      if (enabled) {
        try {
          themeConfig = await loadThemeFiles(config.root);
        } catch (error) {
          config.logger.warn("[flowTracer] Failed to load theme files.");
          config.logger.warn(
            error instanceof Error ? error.message : String(error),
          );
          themeConfig = {};
        }
      }
    },

    transformIndexHtml: {
      order: "pre",
      handler(_html, ctx) {
        if (!enabled) return [];

        const tags = [];

        // Inject theme config as a global variable (before any other scripts)
        if (Object.keys(themeConfig).length > 0) {
          tags.push({
            tag: "script",
            children: `globalThis.__FLOWTRACER_THEME__ = ${JSON.stringify(themeConfig)};`,
            injectTo: injectToHeadPrepend,
          });
        }

        // Inject dashboard configuration and mount script
        if (
          dashboardConfig !== undefined &&
          dashboardConfig.enabled !== false
        ) {
          tags.push({
            tag: "script",
            children: `globalThis.__autoTracerDashboardConfig = ${JSON.stringify(dashboardConfig)};`,
            injectTo: injectToHeadPrepend,
          });

          // Import and mount dashboard after config is set
          tags.push({
            tag: "script",
            attrs: { type: "module" },
            children: `import { mountDashboard } from ${JSON.stringify(dashboardImportSpecifier)};\nmountDashboard();`,
            injectTo: injectToHeadPrepend,
          });
        }

        void ctx;

        if (outputMode !== undefined) {
          tags.push({
            tag: "script",
            attrs: { type: "module" },
            children:
              `globalThis.__autoTracerInternal = globalThis.__autoTracerInternal ?? { outputMode: ${JSON.stringify(
                outputMode,
              )}, subscribers: [] };` +
              `\nglobalThis.__autoTracerInternal.outputMode = ${JSON.stringify(
                outputMode,
              )};`,
            injectTo: injectToBodyPrepend,
          });
        }

        const flowModuleId = "@autotracer/flow";
        const flowRuntimeModuleId = "@autotracer/flow/runtime";

        const bootstrapLines: string[] = [];
        if (runtimeControlled) {
          bootstrapLines.push(`import ${JSON.stringify(flowRuntimeModuleId)};`);
        } else {
          bootstrapLines.push(`import ${JSON.stringify(flowModuleId)};`);
        }

        if (outputMode !== undefined) {
          bootstrapLines.push(
            `globalThis.autoTracer?.setOutputMode(${JSON.stringify(outputMode)});`,
          );
        }

        tags.push({
          tag: "script",
          attrs: { type: "module" },
          children: bootstrapLines.join("\n"),
          injectTo: injectToBodyPrepend,
        });

        return tags;
      },
    },

    transform(code: string, id: string) {
      // Skip if disabled
      if (!enabled) return null;

      // Skip Vite internal runtime code (virtual modules, preload helpers, etc.)
      if (id.startsWith("\0") || id.includes("?")) return null;

      // Skip node_modules
      if (id.includes("node_modules")) return null;

      // Skip @autotracer packages and logger to avoid circular instrumentation
      // Match the same patterns as the Babel plugin:
      // - packages/auto-tracer-flow/dist or packages/auto-tracer-flow/src
      // - packages/auto-tracer-logger/dist or packages/auto-tracer-logger/src
      // - packages/auto-tracer-plugin-*/dist or packages/auto-tracer-plugin-*/src
      const shouldSkip =
        /[\/\\]packages[\/\\]auto-tracer-flow[\/\\](src|dist)[\/\\]/.test(id) ||
        /[\/\\]packages[\/\\]auto-tracer-logger[\/\\](src|dist)[\/\\]/.test(
          id,
        ) ||
        /[\/\\]packages[\/\\]auto-tracer-plugin-[^\/\\]+[\/\\](src|dist)[\/\\]/.test(
          id,
        );

      if (shouldSkip) {
        return null;
      }

      // Only process JS/TS files
      if (!/\.(m?[jt]sx?)$/.test(id)) return null;

      // Check include/exclude patterns using normalized config (applies defaults)
      if (
        !babelFlowModule.shouldProcessFile(
          id,
          normalizedConfig.include,
          normalizedConfig.exclude,
        )
      ) {
        return null;
      }

      try {
        // Use createRequire for CJS modules in ESM context
        const babel = require("@babel/core");
        // Defensive interop: installed packages always expose .default; CJS fallback (?? right-hand side) is unreachable in practice.
        // Untestable: @babel/core is loaded via inline require() which vi.mock cannot intercept.
        /* v8 ignore next 2 */
        const flowTracerBabelPlugin =
          babelFlowModule?.default ?? babelFlowModule;

        // Determine which presets to use based on file extension
        const presets: any[] = [];
        if (/\.tsx?$/.test(id)) {
          const isTSX = id.endsWith(".tsx");
          const typescriptPresetModule = require("@babel/preset-typescript");
          // Defensive interop: same CJS/ESM module shape guard as above; unreachable when packages are installed normally.
          // Untestable: @babel/preset-typescript is loaded via inline require() which vi.mock cannot intercept.
          /* v8 ignore next 2 */
          const typescriptPreset =
            typescriptPresetModule?.default ?? typescriptPresetModule;
          presets.push([
            typescriptPreset,
            {
              isTSX,
              allExtensions: isTSX, // Required when isTSX is true
            },
          ]);
        }

        const result = babel.transformSync(code, {
          filename: id,
          plugins: [[flowTracerBabelPlugin, normalizedConfig]],
          presets,
          sourceMaps: true,
          configFile: false,
          babelrc: false,
        });

        // Defensive guard: babel.transformSync returns a result with code in all normal cases.
        // Untestable: the Babel call uses inline require() which vi.mock cannot intercept.
        /* v8 ignore next */
        if (!result || !result.code) return null;

        return {
          code: result.code,
          map: result.map,
          moduleType: "js", // Vite 8/Rolldown: Must specify when transforming TS/TSX to JS
        };
      } catch (error) {
        // Defensive guard: Babel always throws Error instances; String(error) fallback is unreachable in practice.
        // Untestable: @babel/core uses inline require() which vi.mock cannot intercept.
        /* v8 ignore next 2 */
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        warn(`Flow tracer transform failed for ${id}: ${errorMessage}`);
        return null;
      }
    },
  };
}
