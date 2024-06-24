import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    copyPublicDir: false,
    emptyOutDir: false, // to retain the types folder generated by tsc
    lib: {
      // src/indext.ts is where we have exported the component(s)
      entry: resolve(__dirname, "src/index.ts"),
      name: "VitepressTemplPreview",
      formats: ["es"],
      fileName: (format) => `vitepress-templ-preview.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["markdown-it", "shiki", "shikiTempl", "vue", "vitepress"],
      output: {
        // disable warning on src/index.ts using both default and named export
        exports: "named",
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: "Vue",
          shiki: "shiki",
          shikiTempl: "shiki-templ",
        },
      },
    },
  },
});
