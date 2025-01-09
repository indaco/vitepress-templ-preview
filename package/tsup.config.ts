import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/internals/css-processor/**/*.ts',
    'src/plugin/*.ts',
    'src/cache-service.ts',
    'src/code-extractor.ts',
    'src/highlighter.ts',
    'src/logger.ts',
    'src/script-manager.ts',
    'src/scripts-optimizer.ts',
    'src/styles-optimizer.ts',
    'src/types.ts',
    'src/user-messages.ts',
    'src/utils.ts',
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
