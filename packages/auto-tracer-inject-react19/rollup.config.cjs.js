import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: '.build/cjs/index.js',
  output: {
    file: 'dist/cjs/index.cjs',
    format: 'cjs',
    sourcemap: true,
    exports: 'named'
  },
  external: ['@babel/generator', '@babel/parser', '@babel/traverse', '@babel/types'],
  plugins: [
    nodeResolve(),
    commonjs()
  ]
};
