import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/esm/index.js',
    format: 'esm',
    sourcemap: true,
  },
  external: ['@babel/generator', '@babel/parser', '@babel/traverse', '@babel/types'],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.esm.json',
      declaration: true,
      declarationDir: './dist/esm',
      rootDir: './src'
    })
  ]
};
