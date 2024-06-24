import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/types.ts", "src/utils.ts", "src/plugin/index.ts"],
  outExtension({ format }) {
    return {
      js: `.${format}.js`,
    };
  },
  format: ["esm"],
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: false,
  external: ["markdown-it", "shiki", "shikiTempl", "vue", "vitepress"],
});
