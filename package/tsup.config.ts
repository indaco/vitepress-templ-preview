import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/code-extractor.ts',
    'src/logger.ts',
    'src/scripts-optimizer.ts',
    'src/shared.ts',
    'src/styles-optimizer.ts',
    'src/types.ts',
    'src/user-messages.ts',
    'src/utils.ts',
    'src/plugin/helpers.ts',
    'src/plugin/index.ts',
    'src/plugin/markdown-it-templ-preview.ts',
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
