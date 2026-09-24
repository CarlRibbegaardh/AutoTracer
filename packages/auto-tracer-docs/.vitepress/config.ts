import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

/**
 * VitePress configuration for AutoTracer documentation site
 *
 * @see https://vitepress.dev/reference/site-config
 */
export default withMermaid(
  defineConfig({
    title: "AutoTracer",
    description:
      "Automated tracing for JavaScript and React - debug code flow and component renders effortlessly",

    themeConfig: {
      logo: "/logo.svg",

      nav: [
        { text: "Guide", link: "/guide/introduction" },
        { text: "Dashboard", link: "/dashboard/" },
        { text: "Settings", link: "/reference/runtime/" },
        { text: "Themes", link: "/themes/" },
        { text: "API Reference", link: "/api/" },
        { text: "Examples", link: "/examples/basic-usage" },
        { text: "Best Practices", link: "/best-practices/security" },
        {
          text: "GitHub",
          link: "https://github.com/CarlRibbegaardh/AutoTracer",
        },
      ],

      sidebar: {
        "/guide/": [
          {
            text: "Start Here",
            items: [
              { text: "Your First Trace", link: "/guide/first-trace" },
              { text: "Use With an AI Agent", link: "/guide/agents" },
              { text: "Capture Workflows", link: "/guide/capture/" },
              { text: "Analyze a Trace", link: "/guide/capture/analyze" },
            ],
          },
          {
            text: "Introduction",
            items: [
              { text: "What is AutoTracer?", link: "/guide/introduction" },
              { text: "Why AutoTracer?", link: "/guide/why-autotracer" },
              {
                text: "Choosing Your Tracer",
                link: "/guide/choosing-your-tracer",
              },
            ],
          },
          {
            text: "Quick Start",
            items: [
              { text: "FlowTracer", link: "/guide/quickstart-flow" },
              {
                text: "ReactTracer (React 18)",
                link: "/guide/quickstart-react",
              },
              {
                text: "ReactTracer (React 19)",
                link: "/guide/quickstart-react19",
              },
            ],
          },
          {
            text: "Installation",
            items: [
              {
                text: "FlowTracer",
                collapsed: true,
                items: [
                  { text: "Vite", link: "/guide/installation-flow-vite" },
                  {
                    text: "Webpack / Babel",
                    link: "/guide/quickstart-flow#for-webpack",
                  },
                ],
              },
              {
                text: "ReactTracer (React 18)",
                collapsed: true,
                items: [
                  { text: "Vite", link: "/guide/installation-react-vite" },
                  {
                    text: "Next.js (Pages)",
                    link: "/guide/installation-react-nextjs-pages",
                  },
                  {
                    text: "Next.js (App)",
                    link: "/guide/installation-react-nextjs-app",
                  },
                  {
                    text: "Create React App",
                    link: "/guide/installation-react-cra",
                  },
                ],
              },
              {
                text: "ReactTracer (React 19)",
                collapsed: true,
                items: [
                  {
                    text: "Vite",
                    link: "/guide/installation-react19-vite",
                  },
                  {
                    text: "Next.js (App)",
                    link: "/guide/installation-react19-nextjs-app",
                  },
                ],
              },
            ],
          },
          {
            text: "Configuration",
            items: [
              { text: "FlowTracer Options", link: "/guide/config-flow" },
              {
                text: "ReactTracer (React 18) Options",
                link: "/guide/config-react",
              },
              {
                text: "ReactTracer (React 19) Options",
                link: "/guide/config-react19",
              },
            ],
          },
          {
            text: "Capture Workflows",
            items: [
              { text: "Overview", link: "/guide/capture/" },
              { text: "Browser Capture", link: "/guide/capture/browser" },
              {
                text: "FlowTracer In Vitest",
                link: "/guide/capture/flow-vitest",
              },
              {
                text: "Trace From A Browser Test",
                link: "/guide/capture/browser-tests",
              },
              { text: "Analyze A Trace", link: "/guide/capture/analyze" },
            ],
          },
          {
            text: "Migration",
            items: [
              {
                text: "React 18 to React 19",
                link: "/guide/migration-react18-to-react19",
              },
            ],
          },
          {
            text: "Advanced",
            items: [{ text: "Monorepo Setup", link: "/guide/monorepo" }],
          },
          {
            text: "Troubleshooting",
            link: "/guide/troubleshooting",
          },
        ],

        "/dashboard/": [
          {
            text: "Dashboard",
            items: [
              { text: "Overview", link: "/dashboard/" },
              { text: "Web Apps", link: "/dashboard/webapps" },
              { text: "Platform Guidance", link: "/dashboard/platforms" },
              { text: "Package Reference", link: "/dashboard/reference" },
            ],
          },
        ],

        "/api/": [
          {
            text: "API Reference",
            items: [{ text: "Overview", link: "/api/" }],
          },
          {
            text: "ReactTracer (React 18)",
            items: [
              { text: "@autotracer/react18", link: "/api/react18" },
              {
                text: "@autotracer/plugin-vite-react18",
                link: "/api/plugin-vite-react18",
              },
              {
                text: "@autotracer/plugin-babel-react18",
                link: "/api/plugin-babel-react18",
              },
              {
                text: "@autotracer/inject-react18",
                link: "/api/inject-react18",
              },
            ],
          },
          {
            text: "ReactTracer (React 19)",
            items: [
              { text: "@autotracer/react19", link: "/api/react19" },
              {
                text: "@autotracer/plugin-vite-react19",
                link: "/api/plugin-vite-react19",
              },
              {
                text: "@autotracer/plugin-babel-react19",
                link: "/api/plugin-babel-react19",
              },
              {
                text: "@autotracer/inject-react19",
                link: "/api/inject-react19",
              },
            ],
          },
          {
            text: "FlowTracer",
            items: [
              { text: "@autotracer/flow", link: "/api/flow" },
              {
                text: "@autotracer/plugin-babel-flow",
                link: "/api/plugin-babel-flow",
              },
              {
                text: "@autotracer/plugin-vite-flow",
                link: "/api/plugin-vite-flow",
              },
            ],
          },
          {
            text: "Utilities",
            items: [{ text: "@autotracer/logger", link: "/api/logger" }],
          },
        ],

        "/examples/": [
          {
            text: "Examples",
            items: [
              { text: "Basic Usage", link: "/examples/basic-usage" },
              {
                text: "Islands Architecture",
                link: "/examples/islands",
              },
              {
                text: "React 19 with TypeScript 6",
                link: "/examples/react19-typescript6",
              },
              {
                text: "React 19 with TypeScript 7",
                link: "/examples/react19-typescript7",
              },
              { text: "Microfrontends", link: "/examples/microfrontends" },
              { text: "Custom Filtering", link: "/examples/custom-filtering" },
              {
                text: "Advanced Patterns",
                link: "/examples/advanced-patterns",
              },
            ],
          },
        ],

        "/themes/": [
          {
            text: "Themes",
            items: [{ text: "Overview", link: "/themes/" }],
          },
          {
            text: "ReactTracer",
            items: [
              { text: "React 18 Theme API", link: "/themes/react18/api" },
              {
                text: "React 18 Example Themes",
                link: "/themes/react18/examples",
              },
              { text: "React 19 Theme API", link: "/themes/react19/api" },
              {
                text: "React 19 Example Themes",
                link: "/themes/react19/examples",
              },
            ],
          },
          {
            text: "FlowTracer",
            items: [
              { text: "Theme API", link: "/themes/flow/api" },
              { text: "Example Themes", link: "/themes/flow/examples" },
            ],
          },
        ],

        "/best-practices/": [
          {
            text: "Best Practices",
            items: [
              {
                text: "Security Considerations",
                link: "/best-practices/security",
              },
              {
                text: "Performance Optimization",
                link: "/best-practices/performance",
              },
              {
                text: "QA and Public Builds",
                link: "/best-practices/production",
              },
              { text: "Common Pitfalls", link: "/best-practices/pitfalls" },
            ],
          },
        ],

        "/reference/": [
          {
            text: "Runtime",
            link: "/reference/runtime/",
            items: [
              {
                text: "FlowTracer",
                link: "/reference/runtime/flow/",
                collapsed: false,
                items: [
                  {
                    text: "Overview",
                    link: "/reference/runtime/flow/",
                  },
                  {
                    text: "theme",
                    link: "/reference/runtime/flow/config/theme",
                  },
                ],
              },
              {
                text: "ReactTracer (React 18)",
                link: "/reference/runtime/react18/",
                collapsed: false,
                items: [
                  {
                    text: "Overview",
                    link: "/reference/runtime/react18/",
                  },
                  {
                    text: "outputMode",
                    link: "/reference/runtime/react18/config/outputMode",
                  },
                  {
                    text: "enabled",
                    link: "/reference/runtime/react18/config/enabled",
                  },
                  {
                    text: "includeReconciled",
                    link: "/reference/runtime/react18/config/includeReconciled",
                  },
                  {
                    text: "includeSkipped",
                    link: "/reference/runtime/react18/config/includeSkipped",
                  },
                  {
                    text: "includeMount",
                    link: "/reference/runtime/react18/config/includeMount",
                  },
                  {
                    text: "includeRendered",
                    link: "/reference/runtime/react18/config/includeRendered",
                  },
                  {
                    text: "skippedObjectProps",
                    link: "/reference/runtime/react18/config/skippedObjectProps",
                  },
                  {
                    text: "showFlags",
                    link: "/reference/runtime/react18/config/showFlags",
                  },
                  {
                    text: "internalLogLevel",
                    link: "/reference/runtime/react18/config/internalLogLevel",
                  },
                  {
                    text: "showLevelDetails",
                    link: "/reference/runtime/react18/config/showLevelDetails",
                  },
                  {
                    text: "filterEmptyNodes",
                    link: "/reference/runtime/react18/config/filterEmptyNodes",
                  },
                  {
                    text: "includeNonTrackedBranches",
                    link: "/reference/runtime/react18/config/includeNonTrackedBranches",
                  },
                  {
                    text: "maxFiberDepth",
                    link: "/reference/runtime/react18/config/maxFiberDepth",
                  },
                  {
                    text: "detectIdenticalValueChanges",
                    link: "/reference/runtime/react18/config/detectIdenticalValueChanges",
                  },
                  {
                    text: "trackedStateResolution",
                    link: "/reference/runtime/react18/config/trackedStateResolution",
                  },
                  {
                    text: "functionCache",
                    link: "/reference/runtime/react18/config/functionCache",
                  },
                  {
                    text: "functionCacheLogging",
                    link: "/reference/runtime/react18/config/functionCacheLogging",
                  },
                  {
                    text: "colors",
                    link: "/reference/runtime/react18/config/colors",
                  },
                  {
                    text: "startTriggerFunctionName",
                    link: "/reference/runtime/react18/config/startTriggerFunctionName",
                  },
                  {
                    text: "endTriggerFunctionName",
                    link: "/reference/runtime/react18/config/endTriggerFunctionName",
                  },
                  {
                    text: "endTriggerMode",
                    link: "/reference/runtime/react18/config/endTriggerMode",
                  },
                  {
                    text: "triggerRearmMode",
                    link: "/reference/runtime/react18/config/triggerRearmMode",
                  },
                ],
              },
              {
                text: "ReactTracer (React 19)",
                link: "/reference/runtime/react19/",
                collapsed: false,
                items: [
                  {
                    text: "Overview",
                    link: "/reference/runtime/react19/",
                  },
                  {
                    text: "outputMode",
                    link: "/reference/runtime/react19/config/outputMode",
                  },
                  {
                    text: "enabled",
                    link: "/reference/runtime/react19/config/enabled",
                  },
                  {
                    text: "includeReconciled",
                    link: "/reference/runtime/react19/config/includeReconciled",
                  },
                  {
                    text: "includeSkipped",
                    link: "/reference/runtime/react19/config/includeSkipped",
                  },
                  {
                    text: "includeMount",
                    link: "/reference/runtime/react19/config/includeMount",
                  },
                  {
                    text: "includeRendered",
                    link: "/reference/runtime/react19/config/includeRendered",
                  },
                  {
                    text: "skippedObjectProps",
                    link: "/reference/runtime/react19/config/skippedObjectProps",
                  },
                  {
                    text: "showFlags",
                    link: "/reference/runtime/react19/config/showFlags",
                  },
                  {
                    text: "internalLogLevel",
                    link: "/reference/runtime/react19/config/internalLogLevel",
                  },
                  {
                    text: "showLevelDetails",
                    link: "/reference/runtime/react19/config/showLevelDetails",
                  },
                  {
                    text: "filterEmptyNodes",
                    link: "/reference/runtime/react19/config/filterEmptyNodes",
                  },
                  {
                    text: "includeNonTrackedBranches",
                    link: "/reference/runtime/react19/config/includeNonTrackedBranches",
                  },
                  {
                    text: "maxFiberDepth",
                    link: "/reference/runtime/react19/config/maxFiberDepth",
                  },
                  {
                    text: "detectIdenticalValueChanges",
                    link: "/reference/runtime/react19/config/detectIdenticalValueChanges",
                  },
                  {
                    text: "trackedStateResolution",
                    link: "/reference/runtime/react19/config/trackedStateResolution",
                  },
                  {
                    text: "functionCache",
                    link: "/reference/runtime/react19/config/functionCache",
                  },
                  {
                    text: "functionCacheLogging",
                    link: "/reference/runtime/react19/config/functionCacheLogging",
                  },
                  {
                    text: "colors",
                    link: "/reference/runtime/react19/config/colors",
                  },
                  {
                    text: "startTriggerFunctionName",
                    link: "/reference/runtime/react19/config/startTriggerFunctionName",
                  },
                  {
                    text: "endTriggerFunctionName",
                    link: "/reference/runtime/react19/config/endTriggerFunctionName",
                  },
                  {
                    text: "endTriggerMode",
                    link: "/reference/runtime/react19/config/endTriggerMode",
                  },
                  {
                    text: "triggerRearmMode",
                    link: "/reference/runtime/react19/config/triggerRearmMode",
                  },
                ],
              },
            ],
          },
          {
            text: "Build",
            items: [
              {
                text: "ReactTracer (React 18) Vite Plugin",
                collapsed: false,
                items: [
                  {
                    text: "Overview",
                    link: "/reference/build/react18/vite/",
                  },
                  {
                    text: "inject",
                    link: "/reference/build/react18/vite/config/inject",
                  },
                  {
                    text: "mode",
                    link: "/reference/build/react18/vite/config/mode",
                  },
                  {
                    text: "pragma comments",
                    link: "/reference/build/react18/vite/pragmas",
                  },
                  {
                    text: "include",
                    link: "/reference/build/react18/vite/config/include",
                  },
                  {
                    text: "exclude",
                    link: "/reference/build/react18/vite/config/exclude",
                  },
                  {
                    text: "serverComponents",
                    link: "/reference/build/react18/vite/config/serverComponents",
                  },
                  {
                    text: "importSource",
                    link: "/reference/build/react18/vite/config/importSource",
                  },
                  {
                    text: "labelHooks",
                    link: "/reference/build/react18/vite/config/labelHooks",
                  },
                  {
                    text: "labelHooksPattern",
                    link: "/reference/build/react18/vite/config/labelHooksPattern",
                  },
                  {
                    text: "buildWithWorkspaceLibs",
                    link: "/reference/build/react18/vite/config/buildWithWorkspaceLibs",
                  },
                  {
                    text: "dashboardConfig",
                    link: "/reference/build/react18/vite/config/dashboardConfig",
                  },
                  {
                    text: "outputMode",
                    link: "/reference/build/react18/vite/config/outputMode",
                  },
                  {
                    text: "reactUmdSrc",
                    link: "/reference/build/react18/vite/config/reactUmdSrc",
                  },
                  {
                    text: "reactDomUmdSrc",
                    link: "/reference/build/react18/vite/config/reactDomUmdSrc",
                  },
                  {
                    text: "prefix",
                    link: "/reference/build/react18/vite/config/prefix",
                  },
                ],
              },
              {
                text: "ReactTracer (React 19) Vite Plugin",
                collapsed: false,
                items: [
                  {
                    text: "Overview",
                    link: "/reference/build/react19/vite/",
                  },
                  {
                    text: "inject",
                    link: "/reference/build/react19/vite/config/inject",
                  },
                  {
                    text: "mode",
                    link: "/reference/build/react19/vite/config/mode",
                  },
                  {
                    text: "pragma comments",
                    link: "/reference/build/react19/vite/pragmas",
                  },
                  {
                    text: "include",
                    link: "/reference/build/react19/vite/config/include",
                  },
                  {
                    text: "exclude",
                    link: "/reference/build/react19/vite/config/exclude",
                  },
                  {
                    text: "serverComponents",
                    link: "/reference/build/react19/vite/config/serverComponents",
                  },
                  {
                    text: "importSource",
                    link: "/reference/build/react19/vite/config/importSource",
                  },
                  {
                    text: "labelHooks",
                    link: "/reference/build/react19/vite/config/labelHooks",
                  },
                  {
                    text: "labelHooksPattern",
                    link: "/reference/build/react19/vite/config/labelHooksPattern",
                  },
                  {
                    text: "buildWithWorkspaceLibs",
                    link: "/reference/build/react19/vite/config/buildWithWorkspaceLibs",
                  },
                  {
                    text: "dashboardConfig",
                    link: "/reference/build/react19/vite/config/dashboardConfig",
                  },
                  {
                    text: "outputMode",
                    link: "/reference/build/react19/vite/config/outputMode",
                  },
                  {
                    text: "reactUmdSrc",
                    link: "/reference/build/react19/vite/config/reactUmdSrc",
                  },
                  {
                    text: "reactDomUmdSrc",
                    link: "/reference/build/react19/vite/config/reactDomUmdSrc",
                  },
                  {
                    text: "prefix",
                    link: "/reference/build/react19/vite/config/prefix",
                  },
                ],
              },
              {
                text: "ReactTracer (React 18) Babel Plugin",
                collapsed: false,
                items: [
                  {
                    text: "Overview",
                    link: "/reference/build/react18/babel/",
                  },
                  {
                    text: "outputMode",
                    link: "/reference/build/react18/babel/config/outputMode",
                  },
                  {
                    text: "mode",
                    link: "/reference/build/react18/babel/config/mode",
                  },
                  {
                    text: "pragma comments",
                    link: "/reference/build/react18/babel/pragmas",
                  },
                  {
                    text: "include",
                    link: "/reference/build/react18/babel/config/include",
                  },
                  {
                    text: "exclude",
                    link: "/reference/build/react18/babel/config/exclude",
                  },
                  {
                    text: "serverComponents",
                    link: "/reference/build/react18/babel/config/serverComponents",
                  },
                  {
                    text: "importSource",
                    link: "/reference/build/react18/babel/config/importSource",
                  },
                  {
                    text: "labelHooks",
                    link: "/reference/build/react18/babel/config/labelHooks",
                  },
                  {
                    text: "labelHooksPattern",
                    link: "/reference/build/react18/babel/config/labelHooksPattern",
                  },
                  {
                    text: "prefix",
                    link: "/reference/build/react18/babel/config/prefix",
                  },
                ],
              },
              {
                text: "ReactTracer (React 19) Babel Plugin",
                collapsed: false,
                items: [
                  {
                    text: "Overview",
                    link: "/reference/build/react19/babel/",
                  },
                  {
                    text: "outputMode",
                    link: "/reference/build/react19/babel/config/outputMode",
                  },
                  {
                    text: "mode",
                    link: "/reference/build/react19/babel/config/mode",
                  },
                  {
                    text: "pragma comments",
                    link: "/reference/build/react19/babel/pragmas",
                  },
                  {
                    text: "include",
                    link: "/reference/build/react19/babel/config/include",
                  },
                  {
                    text: "exclude",
                    link: "/reference/build/react19/babel/config/exclude",
                  },
                  {
                    text: "serverComponents",
                    link: "/reference/build/react19/babel/config/serverComponents",
                  },
                  {
                    text: "importSource",
                    link: "/reference/build/react19/babel/config/importSource",
                  },
                  {
                    text: "labelHooks",
                    link: "/reference/build/react19/babel/config/labelHooks",
                  },
                  {
                    text: "labelHooksPattern",
                    link: "/reference/build/react19/babel/config/labelHooksPattern",
                  },
                  {
                    text: "prefix",
                    link: "/reference/build/react19/babel/config/prefix",
                  },
                ],
              },
              {
                text: "ReactTracer (React 18) Shared Transform",
                collapsed: false,
                items: [
                  {
                    text: "Overview",
                    link: "/reference/build/react18/inject/",
                  },
                  {
                    text: "mode",
                    link: "/reference/build/react18/inject/config/mode",
                  },
                  {
                    text: "include",
                    link: "/reference/build/react18/inject/config/include",
                  },
                  {
                    text: "exclude",
                    link: "/reference/build/react18/inject/config/exclude",
                  },
                  {
                    text: "serverComponents",
                    link: "/reference/build/react18/inject/config/serverComponents",
                  },
                  {
                    text: "importSource",
                    link: "/reference/build/react18/inject/config/importSource",
                  },
                  {
                    text: "labelHooks",
                    link: "/reference/build/react18/inject/config/labelHooks",
                  },
                  {
                    text: "labelHooksPattern",
                    link: "/reference/build/react18/inject/config/labelHooksPattern",
                  },
                ],
              },
              {
                text: "ReactTracer (React 19) Shared Transform",
                collapsed: false,
                items: [
                  {
                    text: "Overview",
                    link: "/reference/build/react19/inject/",
                  },
                  {
                    text: "mode",
                    link: "/reference/build/react19/inject/config/mode",
                  },
                  {
                    text: "include",
                    link: "/reference/build/react19/inject/config/include",
                  },
                  {
                    text: "exclude",
                    link: "/reference/build/react19/inject/config/exclude",
                  },
                  {
                    text: "serverComponents",
                    link: "/reference/build/react19/inject/config/serverComponents",
                  },
                  {
                    text: "importSource",
                    link: "/reference/build/react19/inject/config/importSource",
                  },
                  {
                    text: "labelHooks",
                    link: "/reference/build/react19/inject/config/labelHooks",
                  },
                  {
                    text: "labelHooksPattern",
                    link: "/reference/build/react19/inject/config/labelHooksPattern",
                  },
                ],
              },
              {
                text: "FlowTracer Vite Plugin",
                collapsed: false,
                items: [
                  {
                    text: "Overview",
                    link: "/reference/build/flow/vite/",
                  },
                  {
                    text: "Pragmas",
                    link: "/reference/build/flow/vite/pragmas",
                  },
                  {
                    text: "include",
                    link: "/reference/build/flow/vite/config/include",
                  },
                ],
              },
            ],
          },
        ],
      },

      socialLinks: [
        {
          icon: "github",
          link: "https://github.com/CarlRibbegaardh/AutoTracer",
        },
      ],

      search: {
        provider: "local",
      },

      editLink: {
        pattern:
          "https://github.com/CarlRibbegaardh/AutoTracer/edit/main/packages/auto-tracer-docs/:path",
        text: "Edit this page on GitHub",
      },

      footer: {
        message: "Released under the MIT License.",
        copyright: "Copyright © Carl Ribbegårdh",
      },
    },

    markdown: {
      theme: { light: "light-plus", dark: "dark-plus" },
      lineNumbers: true,
    },
  }),
);
