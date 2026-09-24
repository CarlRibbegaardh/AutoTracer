import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: '.build/esm/index.js',
  output: {
    file: 'dist/esm/index.js',
    format: 'esm',
    sourcemap: true,
  },
  external: ['@babel/generator', '@babel/parser', '@babel/traverse', '@babel/types'],
  plugins: [
    nodeResolve(),
    commonjs()
  ]
};
