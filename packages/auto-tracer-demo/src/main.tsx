import { createRoot } from "react-dom/client";
import { reactTracer, stopReactTracer } from "@autotracer/react18";
import { startMockServiceWorker } from "./mocks/browser";
import { App } from "./App";

/**
 * Initialize React18 ReactTracer before React renders
 */
reactTracer({});

/**
 * Flow tracer is configured in vite.config.ts with runtimeControlled: true
 * It starts dormant and is activated via console API
 */

/**
 * Expose global helpers for controlling all tracers at once
 */
globalThis.startAllTracing = () => {
  globalThis.autoTracer?.reactTracer.start();
  globalThis.autoTracer?.flowTracer.start();
  globalThis.autoTracer?.networkTracer?.start();

  console.log("✅ All tracing started (React18 + Flow + Network)");
};

globalThis.stopAllTracing = () => {
  if (globalThis.autoTracer) {
    globalThis.autoTracer.reactTracer.stop();
    globalThis.autoTracer.flowTracer.stop();
    globalThis.autoTracer.networkTracer?.stop();
  } else {
    stopReactTracer();
  }

  console.log("🛑 All tracing stopped");
};

/**
 * Start mock service worker and render app
 */
const startApp = async () => {
  await startMockServiceWorker();

  const root = document.getElementById("root");
  if (!root) throw new Error("Root element not found");

  createRoot(root).render(<App />);
};

startApp().catch(console.error);
