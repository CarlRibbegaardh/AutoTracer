import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: ".build/index.js",
  output: {
    file: "dist/index.js",
    format: "cjs",
    exports: "default",
    interop: "default",
    sourcemap: true,
  },
  external: ["@babel/core"],
  plugins: [json(), nodeResolve(), commonjs()],
};
