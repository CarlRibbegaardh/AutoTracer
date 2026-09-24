import ReactDOM from "react-dom/client";
import { reactTracer } from "@autotracer/react18";
import App from "./App.tsx";

// Initialize reactTracer before anything else
reactTracer({
  outputMode: "copy-paste",
  enabled: true,
  showFlags: true,
  includeNonTrackedBranches: false,
  maxFiberDepth: 100,
  internalLogLevel: "error",
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
