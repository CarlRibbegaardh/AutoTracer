import { reactTracer, type ReactTracerOptions } from "@autotracer/react19";

const options = {
  enabled: false,
} satisfies ReactTracerOptions;

reactTracer(options);
