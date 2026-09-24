import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/cjs/index.js',
    format: 'cjs',
    sourcemap: true,
    exports: 'named'
  },
  external: ['@babel/generator', '@babel/parser', '@babel/traverse', '@babel/types'],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.cjs.json',
      declaration: true,
      declarationDir: './dist/cjs',
      rootDir: './src'
    })
  ]
};
