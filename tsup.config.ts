import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'packages/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ['react', '@dysporium/polyglot-core'],
});

