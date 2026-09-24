import ReactDOM from "react-dom/client";
import { reactTracer } from "@autotracer/react18";
import App from "./App.tsx";
import "./index.css";

// Initialize ReactTracer for standalone mode
// When loaded as a remote, the host's ReactTracer instance is used
if (!window.__REACTTRACER_INITIALIZED__) {
  reactTracer({
    enabled: true,
    includeReconciled: "always" as const,
    showFlags: false,
    includeSkipped: "always" as const,
    internalLogLevel: "debug",
    maxFiberDepth: 2,
    includeNonTrackedBranches: true,
  });
  window.__REACTTRACER_INITIALIZED__ = true;
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
