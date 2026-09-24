import "./AutoTracerGlobalThis.js";

export {
  isReactTracerInitialized,
  reactTracer,
  stopReactTracer,
  updateReactTracerOptions,
  useReactTracer,
} from "./lib/index.js";
export type { ReactTracerOptions, SkippedObjectProp } from "./lib/index.js";
