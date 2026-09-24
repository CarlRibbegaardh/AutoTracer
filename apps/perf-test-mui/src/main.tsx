import { createRoot } from "react-dom/client";
import { reactTracer } from "@autotracer/react18";
import { App } from "./App";

/**
 * Initialize ReactTracer before React renders
 */
reactTracer({
  outputMode: "copy-paste",
  enabled: true,
  // renderer: "console-group",
  // objectRenderingMode: "devtools-json",
  // internalLogLevel: "trace",
  functionCache: true,
  // functionCacheLogging: true,
  maxFiberDepth: 1000,
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  // <StrictMode>
  <App />,
  // </StrictMode>
);
