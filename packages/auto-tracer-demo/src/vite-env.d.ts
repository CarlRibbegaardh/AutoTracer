/// <reference types="vite/client" />

declare global {
  // eslint-disable-next-line no-var
  var autoTracer:
    | {
        getOutputMode: () => "devtools" | "copy-paste";
        setOutputMode: (mode: "devtools" | "copy-paste") => void;
        reactTracer: {
          start: () => void;
          stop: () => void;
          isEnabled: () => boolean;
        };
        flowTracer: {
          start: () => void;
          stop: () => void;
          isEnabled: () => boolean;
        };
        networkTracer?: {
          start: () => void;
          stop: () => void;
          isEnabled: () => boolean;
        };
      }
    | undefined;
  // eslint-disable-next-line no-var
  var startAllTracing: () => void;
  // eslint-disable-next-line no-var
  var stopAllTracing: () => void;
}

export {};
