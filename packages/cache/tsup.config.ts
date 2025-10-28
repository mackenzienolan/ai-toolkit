import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: {
    resolve: true,
    compilerOptions: {
      composite: false,
    },
  },
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  external: ['ai', 'zod', '@ai-toolkit/core', 'react'],
});
