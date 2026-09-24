import vitePlugin, {
  reactTracer,
  type ReactTracerOptions,
} from "@autotracer/plugin-vite-react19";

const options = {
  inject: true,
  outputMode: "devtools",
} satisfies ReactTracerOptions;

const plugin = reactTracer.vite(options);
const defaultPlugin = vitePlugin(options);

void plugin;
void defaultPlugin;
