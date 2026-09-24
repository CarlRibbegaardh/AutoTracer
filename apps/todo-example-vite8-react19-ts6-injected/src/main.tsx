import { reactTracer } from "@autotracer/react19";
import { createRoot } from "react-dom/client";

import { App } from "./App.js";

reactTracer({
  enabled: false,
  outputMode: "copy-paste",
  includeMount: "always",
  includeRendered: "always",
  internalLogLevel: "warn",
});

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Expected the #root element to exist.");
}

createRoot(rootElement).render(<App />);
