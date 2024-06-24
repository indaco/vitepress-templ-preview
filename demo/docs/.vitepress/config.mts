import { defineConfig } from "vitepress";
import { templLang } from "shiki-templ";
import viteTemplPreviewPlugin from "vitepress-templ-preview";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "My Awesome Project",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/templ-preview" },
    ],

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Templ Preview", link: "/templ-preview" },
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
  vite: {
    plugins: [viteTemplPreviewPlugin()],
  },
  markdown: {
    languages: [templLang],
  },
});
