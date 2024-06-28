import { defineConfig } from "vitepress";
import viteTemplPreviewPlugin from "vitepress-templ-preview";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "vitepress-templ-preview",
  description:
    "A Vitepress plugin for easily previewing templ components in Markdown.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      {
        text: "Examples",
        items: [
          { text: "Hello Templ", link: "/hello-preview" },
          { text: "Button", link: "/button-preview" },
          { text: "Alert", link: "/alert-preview" },
        ],
      },
    ],

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Overview", link: "/overview" },
          { text: "Prerequisites", link: "/prerequisites" },
          { text: "Usage", link: "/usage" },
        ],
      },
      {
        text: "Examples",
        items: [
          { text: "Hello Templ", link: "/hello-preview" },
          { text: "Button", link: "/button-preview" },
          { text: "Alert", link: "/alert-preview" },
          { text: "Markdown Examples", link: "/markdown-examples" },
        ],
      },
      {
        text: "Configuration",
        items: [
          { text: "Options", link: "/options" },
          { text: "Vue components", link: "/vue-components" },
        ],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/indaco/vitepress-templ-preview",
      },
    ],
  },
  vite: {
    plugins: [viteTemplPreviewPlugin()],
  },
});
