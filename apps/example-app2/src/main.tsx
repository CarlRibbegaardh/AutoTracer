import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { reactTracer } from "@autotracer/react18";
reactTracer({
  enabled: true,
  includeReconciled: "always" as const,
  showFlags: false,
  includeSkipped: "always" as const,
  internalLogLevel: "debug",
  maxFiberDepth: 2,
  includeNonTrackedBranches: true,
});

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
