import { defineConfig } from "vitepress";
import viteTemplPreviewPlugin from "vitepress-templ-preview";
import type { VTPUserConfig } from "vitepress-templ-preview/types";

const vtpOptions: VTPUserConfig = {
  inputDir: "examples",
};

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
          { text: "Hello Templ", link: "/examples/hello-preview" },
          { text: "Button", link: "/examples/button-preview" },
          { text: "Alert", link: "/examples/alert-preview" },
        ],
      },
    ],

    sidebar: [
      {
        text: "Guide",
        collapsed: false,
        items: [
          { text: "Introduction", link: "/guide/introduction" },
          { text: "Motivation", link: "/guide/motivation" },
          { text: "Prerequisites", link: "/guide/prerequisites" },
          { text: "Usage", link: "/guide/usage" },
        ],
      },
      {
        text: "Examples",
        collapsed: false,
        items: [
          { text: "Hello Templ", link: "/examples/hello/" },
          { text: "Button", link: "/examples/button/" },
          { text: "Alert", link: "/examples/alert/" },
          { text: "Markdown Examples", link: "/examples/markdown-examples" },
        ],
      },
      {
        text: "Customization",
        collapsed: false,
        items: [
          { text: "Options", link: "/customization/options" },
          { text: "Vue components", link: "/customization/vue-components" },
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
    plugins: [viteTemplPreviewPlugin(vtpOptions)],
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
});
