import ReactDOM from "react-dom/client";
import { reactTracer } from "@autotracer/react18";
import App from "./App.tsx";
import "./index.css";

// Initialize ReactTracer before React renders
reactTracer({
	enabled: true,
});

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
