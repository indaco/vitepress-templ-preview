import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/types.ts',
    'src/code-extractor.ts',
    'src/logger.ts',
    'src/shared.ts',
    'src/styles-optimizer.ts',
    'src/scripts-optimizer.ts',
    'src/user-messages.ts',
    'src/utils.ts',
    'src/plugin/index.ts',
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
