import babelPlugin, {
  type ReactTracerOptions,
} from "@autotracer/plugin-babel-react19";

const options = {
  mode: "opt-out",
  outputMode: "devtools",
} satisfies ReactTracerOptions;

void babelPlugin;
void options;
