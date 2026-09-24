import type { TransformConfig } from "@autotracer/inject-react19";
import {
  normalizeConfig,
  shouldProcessFile,
  transform,
} from "@autotracer/inject-react19";
import type { ReactTracerOptions as RuntimeReactTracerOptions } from "@autotracer/react19";
import { loadThemeFiles } from "@autotracer/react19/build-utils";
import { readFileSync } from "fs";
import { resolve } from "path";
import externalGlobals from "rollup-plugin-external-globals";
import { createUnplugin } from "unplugin";
import type { Plugin } from "vite";

/** Dashboard widget configuration. */
interface DashboardConfig {
  /** Enables the dashboard widget. */
  enabled?: boolean;
  /** Starts with the dashboard hidden. */
  hideByDefault?: boolean;
  /** Sets the dashboard screen position. */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  /** Configures dashboard keyboard shortcuts. */
  hotkeys?: {
    /** Sets the tracing toggle shortcut. */
    toggleTracing?: string;
    /** Sets the dashboard visibility shortcut. */
    toggleDashboard?: string;
  };
}

/** React theme configuration accepted by the runtime. */
type ReactThemeConfig = NonNullable<RuntimeReactTracerOptions["colors"]>;

/** Configuration for the React 19 Vite tracer plugin. */
export interface ReactTracerOptions extends Partial<TransformConfig> {
  /** Enables code injection. @defaultValue `true` */
  inject?: boolean;
  /**
   * Enables global-script loading for restricted internal workspace builds.
   *
   * React 19 does not publish official React or ReactDOM UMD files, so
   * `reactUmdSrc` and `reactDomUmdSrc` are required when this option is enabled.
   * @defaultValue `false`
   */
  buildWithWorkspaceLibs?: boolean;
  /** Configures the optional dashboard widget. */
  dashboardConfig?: Partial<DashboardConfig>;
  /** Seeds the AutoTracer output mode before runtime initialization. */
  outputMode?: "devtools" | "copy-paste";
  /**
   * URL or path to a React 19 script that exposes `window.React`.
   * Required when `buildWithWorkspaceLibs` is enabled.
   */
  reactUmdSrc?: string;
  /**
   * URL or path to a ReactDOM 19 script that exposes `window.ReactDOM`.
   * Required when `buildWithWorkspaceLibs` is enabled.
   */
  reactDomUmdSrc?: string;
  /** Prefix prepended to every injected component name. */
  prefix?: string;
}

/** React 19 instrumentation plugin adapters created through unplugin. */
export const reactTracer: {
  /** Creates the React 19 instrumentation plugin for Vite. */
  vite: (options?: ReactTracerOptions) => Plugin | Plugin[];
} = createUnplugin<ReactTracerOptions | undefined>(
  (options = {}) => {
    const config = normalizeConfig(options);
    const enableBuildSupport = options.buildWithWorkspaceLibs ?? false;
    const enableInjection = options.inject ?? true;
    const outputMode = options.outputMode;
    const dashboardConfig = options.dashboardConfig;
    let dashboardImportSpecifier = "@autotracer/dashboard";
    const prefix = options.prefix;
    const reactUmdSrc = options.reactUmdSrc;
    const reactDomUmdSrc = options.reactDomUmdSrc;
    const injectToHeadPrepend = "head-prepend" as const;
    let viteBase = "/";
    let themeConfig: Partial<ReactThemeConfig> = {};

    /** Returns whether all plugin side effects are disabled. */
    function isPluginDisabled(): boolean {
      return !enableInjection || process.env.TRACE_INJECT === "0";
    }

    return {
      name: "auto-tracer-inject",
      enforce: "pre",
      vite: {
        async configResolved(viteConfig) {
          dashboardImportSpecifier =
            viteConfig.command === "serve"
              ? `@autotracer/dashboard?autotracer-dashboard=${process.pid}-${Math.trunc(performance.timeOrigin)}`
              : "@autotracer/dashboard";
          viteBase = viteConfig.base || "/";

          if (isPluginDisabled()) {
            return;
          }

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
          if (command !== "build" || !enableBuildSupport) return;

          viteConfig.build = viteConfig.build || {};
          viteConfig.build.rollupOptions = viteConfig.build.rollupOptions || {};
          const plugins = viteConfig.build.rollupOptions.plugins;
          const globalsPlugin = externalGlobals({
            "@autotracer/react19": "window.ReactTracer",
            react: "window.React",
            "react-dom": "window.ReactDOM",
          });

          if (Array.isArray(plugins)) {
            plugins.push(globalsPlugin);
          } else {
            viteConfig.build.rollupOptions.plugins = [globalsPlugin];
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

            if (outputMode !== undefined) {
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
              tags.push({
                tag: "script" as const,
                attrs: { type: "module" as const },
                children: `import { mountDashboard } from ${JSON.stringify(dashboardImportSpecifier)};\nmountDashboard();`,
                injectTo: injectToHeadPrepend,
              });
            }

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

            if (!enableBuildSupport) {
              console.log(
                "[reactTracer] Returning tags for dev mode:",
                tags.length,
              );
              return tags.length > 0 ? { html, tags } : html;
            }

            if (reactUmdSrc === undefined) {
              throw new Error(
                "React 19 does not publish an official UMD build. Set reactUmdSrc when buildWithWorkspaceLibs is true.",
              );
            }
            if (reactDomUmdSrc === undefined) {
              throw new Error(
                "React 19 does not publish an official UMD build. Set reactDomUmdSrc when buildWithWorkspaceLibs is true.",
              );
            }

            tags.push(
              {
                tag: "script" as const,
                attrs: { src: reactUmdSrc, crossorigin: "" },
                injectTo: injectToHeadPrepend,
              },
              {
                tag: "script" as const,
                attrs: { src: reactDomUmdSrc, crossorigin: "" },
                injectTo: injectToHeadPrepend,
              },
              {
                tag: "script" as const,
                attrs: { src: `${viteBase}auto-tracer-react19.umd.js` },
                injectTo: injectToHeadPrepend,
              },
            );

            return { html, tags };
          },
        },

        generateBundle() {
          if (isPluginDisabled()) return;
          if (!enableBuildSupport) return;

          try {
            const umdPath = resolve(
              process.cwd(),
              "node_modules/@autotracer/react19/dist/index.umd.js",
            );
            const umdContent = readFileSync(umdPath, "utf-8");

            this.emitFile({
              type: "asset",
              fileName: "auto-tracer-react19.umd.js",
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
              moduleType: "js",
            };
          }

          return null;
        } catch (error) {
          console.warn(`Auto-trace transform failed for ${id}:`, error);
          return null;
        }
      },
    };
  },
);

export default reactTracer.vite;
