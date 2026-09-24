/**
 * Describes the Vite hooks emitted by the NetworkTracer integration.
 */
export interface NetworkTracerVitePlugin {
  /** Identifies the plugin to Vite and diagnostics. */
  readonly name: "@autotracer/plugin-vite-network";
  /** Runs the plugin before normal Vite transforms. */
  readonly enforce: "pre";
  /** Captures whether Vite is serving or building the application. */
  readonly configResolved: (config: Readonly<{
    command: "build" | "serve";
  }>) => void;
  /** Prevents the bootstrap-only plugin from transforming application source. */
  readonly transform?: never;
  /** Injects the NetworkTracer bootstrap before application entry modules. */
  readonly transformIndexHtml: Readonly<{
    order: "pre";
    handler: (html: string) => readonly Readonly<{
      tag: "script";
      attrs?: Readonly<{ type: "module" }>;
      children: string;
      injectTo: "head-prepend";
    }>[];
  }>;
}
