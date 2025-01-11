import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/internals/css-processor/**/*.ts',
    'src/plugin/**/*.ts',
    'src/highlighter.ts',
    'src/sanitizer.ts',
    'src/script-manager.ts',
    'src/types.ts',
  ],
  outExtension({ format }) {
    return {
      js: `.${format}.js`,
    };
  },
  format: ['esm'],
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: false,
  minify: true,
  external: ['markdown-it', 'shiki', 'vue', 'vitepress'],
});
