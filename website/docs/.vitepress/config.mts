import { defineConfig } from "vitepress";
import viteTemplPreviewPlugin from "vitepress-templ-preview";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "vitepress-templ-preview",
  description:
    "A VitePress plugin to preview your templ components while documenting them.",
  lastUpdated: true,
  sitemap: {
    hostname: "https://vitepress-templ-preview.indaco.dev",
  },
  themeConfig: {
    search: {
      provider: "local",
    },

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
        collapsed: false,
        items: [
          { text: "Overview", link: "/overview" },
          { text: "Prerequisites", link: "/prerequisites" },
          { text: "Usage", link: "/usage" },
        ],
      },
      {
        text: "Examples",
        collapsed: false,
        items: [
          { text: "Hello Templ", link: "/hello-preview" },
          { text: "Button", link: "/button-preview" },
          { text: "Alert", link: "/alert-preview" },
          { text: "Markdown Examples", link: "/markdown-examples" },
        ],
      },
      {
        text: "Customization",
        collapsed: false,
        items: [
          { text: "Options", link: "/options" },
          { text: "Vue components", link: "/vue-components" },
          { text: "Use a Custom component", link: "/custom-vue-component" },
        ],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/indaco/vitepress-templ-preview",
      },
    ],

    editLink: {
      pattern:
        "https://github.com/indaco/vitepress-templ-preview/edit/main/website/docs/:path",
    },

    footer: {
      message:
        'Released under the <a href="https://github.com/indaco/vitepress-templ-preview#license">MIT License</a>.',
      copyright:
        'Copyright © 2024 <a href="https://github.com/indaco">Mirco Veltri</a>',
    },
  },
  vite: {
    plugins: [viteTemplPreviewPlugin()],
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
});
