import { createUnplugin } from "unplugin";
import type { TransformConfig } from "@autotracer/inject-react18";
import {
  transform,
  normalizeConfig,
  shouldProcessFile,
} from "@autotracer/inject-react18";
import { loadThemeFiles } from "@autotracer/react18/build-utils";
import type { ReactTracerOptions as ReactReactTracerOptions } from "@autotracer/react18";
import externalGlobals from "rollup-plugin-external-globals";
import { readFileSync } from "fs";
import { resolve } from "path";

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
   * @default true
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

/**
 * React theme configuration type extracted from ReactTracerOptions.
 * Represents the color categories used for component and hook rendering.
 */
type ReactThemeConfig = NonNullable<ReactReactTracerOptions["colors"]>;

export interface ReactTracerOptions extends Partial<TransformConfig> {
  /**
   * Enable code injection. When false, the plugin is effectively disabled.
   *
   * Use this to conditionally enable injection based on environment:
   * ```ts
   * reactTracer.vite({ inject: mode === 'development' })
   * ```
   *
   * @default true
   */
  inject?: boolean;

  /**
   * Enable automatic UMD loading for production builds with workspace libraries
   * that are consumed as source (raw `.tsx` files bundled by the host app).
   *
   * When a workspace library is processed by the host app's Rollup pass, the
   * plugin injects `import { useReactTracer } from "@autotracer/react18"` into
   * it. Rollup then cannot resolve that import from the library's own
   * `package.json`, causing a build error. This flag fixes that by externalising
   * `@autotracer/react18`, `react`, and `react-dom` from the **entire build**
   * (via `rollup-plugin-external-globals`) and loading them as UMD globals instead.
   *
   * **Side effect**: React is removed from your app bundle entirely and loaded
   * from the injected UMD `<script>` tags. If those scripts fail to load, the
   * whole app breaks — not just the tracer.
   *
   * When enabled, the plugin automatically:
   * - Externalises `@autotracer/react18`, `react`, and `react-dom` as globals
   * - Emits the ReactTracer UMD build as a bundle asset
   * - Injects `<script>` tags to load React, ReactDOM, and ReactTracer UMD
   *   before your app bundle (see `reactUmdSrc` / `reactDomUmdSrc` to
   *   self-host these instead of loading from the default unpkg.com URLs)
   *
   * Not needed when workspace libraries are pre-built (library mode `dist/`),
   * since the plugin cannot inject into already-compiled JS.
   * Only applies to `vite build` — dev mode is unaffected.
   *
   * @default false
   */
  buildWithWorkspaceLibs?: boolean;

  /**
   * Dashboard widget configuration.
   * Enables runtime controls via hotkeys and an in-app overlay.
   *
   * @default undefined (dashboard not loaded)
   *
   * @example
   * ```ts
   * reactTracer.vite({
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
   * This is injected into the page before tracer initialization so
   * grouping/value-rendering behavior is correct from the first trace.
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

  /**
   * URL or path to a self-hosted React UMD file.
   *
   * When `buildWithWorkspaceLibs` is true, the plugin injects a `<script>` tag
   * to load React as a global. By default it points to unpkg.com, which may be
   * blocked by strict Content Security Policies.
   *
   * Set this to a path served by your own origin (e.g. `'/vendor/react.production.min.js'`)
   * to avoid external CDN requests.
   *
   * Copy the file from `node_modules/react/umd/react.production.min.js`.
   *
   * @default 'https://unpkg.com/react@18.3.1/umd/react.production.min.js'
   */
  reactUmdSrc?: string;

  /**
   * URL or path to a self-hosted ReactDOM UMD file.
   *
   * When `buildWithWorkspaceLibs` is true, the plugin injects a `<script>` tag
   * to load ReactDOM as a global. By default it points to unpkg.com, which may be
   * blocked by strict Content Security Policies.
   *
   * Set this to a path served by your own origin (e.g. `'/vendor/react-dom.production.min.js'`)
   * to avoid external CDN requests.
   *
   * Copy the file from `node_modules/react-dom/umd/react-dom.production.min.js`.
   *
   * @default 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js'
   */
  reactDomUmdSrc?: string;
  /**
   * Optional prefix prepended to every injected component name in logs.
   *
   * Use this when multiple React entry-points (micro-frontends, islands)
   * share a browser tab and you need to distinguish their components.
   *
   * @example
   * prefix: 'Header' // → "Header:MyComponent" in logs
   */
  prefix?: string;
}

export const reactTracer = createUnplugin<ReactTracerOptions | undefined>(
  (options = {}) => {
    const config = normalizeConfig(options);
    const enableBuildSupport = options.buildWithWorkspaceLibs ?? false;
    const enableInjection = options.inject ?? true;
    const outputMode = options.outputMode;
    const dashboardConfig = options.dashboardConfig;
    let dashboardImportSpecifier = "@autotracer/dashboard";
    const prefix = options.prefix;
    const reactUmdSrc =
      options.reactUmdSrc ??
      "https://unpkg.com/react@18.3.1/umd/react.production.min.js";
    const reactDomUmdSrc =
      options.reactDomUmdSrc ??
      "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js";

    const injectToHeadPrepend: "head-prepend" = "head-prepend";

    // Track Vite base path for proper URL generation
    let viteBase = "/";

    // Load theme files at plugin initialization (build time)
    let themeConfig: Partial<ReactThemeConfig> = {};

    /**
     * Returns whether all plugin side effects must be disabled.
     */
    function isPluginDisabled(): boolean {
      return !enableInjection || process.env.TRACE_INJECT === "0";
    }

    return {
      name: "auto-tracer-inject",
      enforce: "pre", // Run before other transformations

      // Vite-specific hooks
      vite: {
        async configResolved(viteConfig) {
          dashboardImportSpecifier =
            viteConfig.command === "serve"
              ? `@autotracer/dashboard?autotracer-dashboard=${process.pid}-${Math.trunc(performance.timeOrigin)}`
              : "@autotracer/dashboard";
          // Capture base path for proper URL generation
          viteBase = viteConfig.base || "/";

          if (isPluginDisabled()) {
            return;
          }

          // Load theme files from project root at build time
          try {
            console.log(
              "[reactTracer] Loading theme files from:",
              viteConfig.root,
            );
            themeConfig = await loadThemeFiles(viteConfig.root);
            console.log(
              "[reactTracer] Theme config loaded:",
              Object.keys(themeConfig).length,
              "categories",
            );
            if (Object.keys(themeConfig).length > 0) {
              console.log(
                "[reactTracer] Theme categories:",
                Object.keys(themeConfig),
              );
            }
          } catch (error) {
            console.warn("[reactTracer] Failed to load theme files:", error);
            themeConfig = {};
          }
        },

        config(viteConfig, { command }) {
          if (isPluginDisabled()) return;

          // Only configure for production builds
          if (command !== "build" || !enableBuildSupport) return;

          // Auto-add external-globals plugin
          viteConfig.build = viteConfig.build || {};
          viteConfig.build.rollupOptions = viteConfig.build.rollupOptions || {};
          const plugins = viteConfig.build.rollupOptions.plugins;

          // Ensure plugins is an array
          if (Array.isArray(plugins)) {
            plugins.push(
              externalGlobals({
                "@autotracer/react18": "window.ReactTracer",
                react: "window.React",
                "react-dom": "window.ReactDOM",
              }),
            );
          } else {
            viteConfig.build.rollupOptions.plugins = [
              externalGlobals({
                "@autotracer/react18": "window.ReactTracer",
                react: "window.React",
                "react-dom": "window.ReactDOM",
              }),
            ];
          }
        },

        transformIndexHtml: {
          order: "pre",
          handler(html) {
            if (isPluginDisabled()) {
              return html;
            }

            console.log("[reactTracer] transformIndexHtml called");
            console.log(
              "[reactTracer] Theme config keys:",
              Object.keys(themeConfig).length,
            );
            const tags = [];

            if (enableInjection && outputMode !== undefined) {
              tags.push({
                tag: "script" as const,
                children:
                  `globalThis.__autoTracerInternal = globalThis.__autoTracerInternal ?? { outputMode: ${JSON.stringify(
                    outputMode,
                  )}, subscribers: [] };` +
                  `\nglobalThis.__autoTracerInternal.outputMode = ${JSON.stringify(
                    outputMode,
                  )};` +
                  `\nglobalThis.autoTracer?.setOutputMode(${JSON.stringify(
                    outputMode,
                  )});`,
                injectTo: injectToHeadPrepend,
              });
            }

            // Inject theme config as a global variable (before any other scripts)
            // Always inject theme in dev mode, conditionally in build mode
            if (Object.keys(themeConfig).length > 0) {
              console.log("[reactTracer] Injecting theme into HTML");
              tags.push({
                tag: "script" as const,
                children: `globalThis.__REACTTRACER_THEME__ = ${JSON.stringify(themeConfig)};`,
                injectTo: injectToHeadPrepend,
              });
            } else {
              console.log("[reactTracer] No theme to inject");
            }

            // Inject dashboard configuration and mount script
            if (
              dashboardConfig !== undefined &&
              dashboardConfig.enabled !== false
            ) {
              console.log("[reactTracer] Injecting dashboard config");
              tags.push({
                tag: "script" as const,
                children: `globalThis.__autoTracerDashboardConfig = ${JSON.stringify(dashboardConfig)};`,
                injectTo: injectToHeadPrepend,
              });

              // Import and mount dashboard after config is set
              tags.push({
                tag: "script" as const,
                attrs: { type: "module" as const },
                children: `import { mountDashboard } from ${JSON.stringify(dashboardImportSpecifier)};\nmountDashboard();`,
                injectTo: injectToHeadPrepend,
              });
            }

            // Inline script to create synthetic DevTools hook BEFORE any React code loads
            // This is needed for production builds when the browser extension isn't installed
            const hookInitScript = `
(function() {
  if (typeof window === 'undefined' || window.__REACT_DEVTOOLS_GLOBAL_HOOK__) return;
  var nextID = 0;
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    renderers: new Map(),
    supportsFiber: true,
    inject: function(injected) { return nextID++; },
    onScheduleFiberRoot: function(id, root, children) {},
    onCommitFiberRoot: function(id, root, maybePriorityLevel, didError) {},
    onCommitFiberUnmount: function() {}
  };
})();
`.trim();

            tags.push({
              tag: "script" as const,
              children: hookInitScript,
              injectTo: injectToHeadPrepend,
            });

            // Only inject UMD loading scripts during build with workspace lib support
            if (!enableBuildSupport) {
              console.log(
                "[reactTracer] Returning tags for dev mode:",
                tags.length,
              );
              return tags.length > 0 ? { html, tags } : html;
            }

            // Add UMD loading script tags for workspace library builds
            tags.push(
              {
                tag: "script" as const,
                attrs: {
                  src: reactUmdSrc,
                  crossorigin: "",
                },
                injectTo: "head-prepend" as const,
              },
              {
                tag: "script" as const,
                attrs: {
                  src: reactDomUmdSrc,
                  crossorigin: "",
                },
                injectTo: "head-prepend" as const,
              },
              {
                tag: "script" as const,
                attrs: { src: `${viteBase}auto-tracer-react18.umd.js` },
                injectTo: "head-prepend" as const,
              },
            );

            // Use Vite's tags API for proper path resolution
            return {
              html,
              tags,
            };
          },
        },

        // Copy UMD to output during build
        generateBundle() {
          if (isPluginDisabled()) return;

          if (!enableBuildSupport) return;

          try {
            // Resolve UMD path from node_modules
            const umdPath = resolve(
              process.cwd(),
              "node_modules/@autotracer/react18/dist/index.umd.js",
            );
            const umdContent = readFileSync(umdPath, "utf-8");

            // Emit as asset
            this.emitFile({
              type: "asset",
              fileName: "auto-tracer-react18.umd.js",
              source: umdContent,
            });
          } catch (error) {
            console.error(
              "ReactTracer plugin: Failed to emit UMD file:",
              error,
            );
          }
        },
      },

      transformInclude(id: string) {
        // Check if injection is disabled via parameter
        if (isPluginDisabled()) {
          return false;
        }

        return shouldProcessFile(id, config);
      },
      transform(code: string, id: string) {
        if (isPluginDisabled()) {
          return null;
        }

        try {
          const result = transform(code, {
            filename: id,
            config,
            prefix,
          });

          if (result.injected) {
            return {
              code: result.code,
              map: result.map,
              moduleType: "js", // Vite 8/Rolldown: Must specify when transforming TS/TSX to JS
            };
          }

          return null; // No transformation needed
        } catch (error) {
          // Log error but don't fail the build
          console.warn(`Auto-trace transform failed for ${id}:`, error);
          return null;
        }
      },
    };
  },
);

// Export for Vite
export default reactTracer.vite;
