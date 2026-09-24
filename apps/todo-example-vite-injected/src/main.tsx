import ReactDOM from "react-dom/client";
import { reactTracer } from "@autotracer/react18";
import App from "./App.tsx";

// Initialize reactTracer before anything else
reactTracer({
  outputMode: "copy-paste",
  // renderer: "console-group",
  // objectRenderingMode: "devtools-json",
  enabled: true,
  showFlags: true,
  includeNonTrackedBranches: false,
  includeReconciled: "always",
  includeSkipped: "never",
  maxFiberDepth: 100,
  filterEmptyNodes: "all",
  internalLogLevel: "warn",
  detectIdenticalValueChanges: true,
  skippedObjectProps: [
    {
      objectName: "ThemeProvider3",
      propNames: ["theme"],
    },
    {
      objectName: "ThemeProvider2",
      propNames: ["theme"],
    },
    {
      objectName: "ThemeProvider",
      propNames: ["theme"],
    },
    {
      objectName: "MuiContainerRoot",
      propNames: ["ownerState"],
    },
    {
      objectName: "Styled(div)",
      propNames: ["theme"],
    },
    {
      objectName: "Insertion6",
      propNames: ["cache"],
    },
    {
      objectName: "Unknown",
      propNames: ["value"],
    },
  ],
});

const rootElement = document.getElementById("root");
if (rootElement === null) {
  throw new Error("Expected #root element to exist.");
}

ReactDOM.createRoot(rootElement).render(
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>
);
