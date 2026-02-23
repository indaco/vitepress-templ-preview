import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/plugin/**/*.ts',
    'src/highlighter.ts',
    'src/sanitizer.ts',
    'src/script-manager.ts',
    'src/types.ts',
  ],
  format: 'esm',
  outExtensions() {
    return {
      js: '.esm.js',
    };
  },
  dts: false,
  sourcemap: false,
  clean: false,
  minify: true,
  hash: false,
  fixedExtension: false,
  inlineOnly: false,
  external: ['markdown-it', 'shiki', 'vue', 'vitepress'],
});
