import { defineConfig } from "vitepress";
import viteTemplPreviewPlugin from "vitepress-templ-preview";
import type { VTPUserConfig } from "vitepress-templ-preview/types";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationErrorLevel,
  transformerNotationFocus,
} from "@shikijs/transformers";

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
          { text: "Hello Templ", link: "/examples/hello" },
          { text: "Button", link: "/examples/button" },
          { text: "Alert", link: "/examples/alert" },
        ],
      },
      {
        text: "v0.1.0",
        items: [
          {
            text: "Changelog",
            link: "https://github.com/indaco/vitepress-templ-preview/blob/main/CHANGELOG.md",
            target: "_blank",
          },
        ],
      },
    ],

    sidebar: [
      {
        text: "Guide",
        collapsed: false,
        items: [
          { text: "Overview", link: "/introduction/overview" },
          { text: "Motivation", link: "/introduction/motivation" },
          { text: "Prerequisites", link: "/introduction/prerequisites" },
          { text: "Usage", link: "/introduction/usage" },
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
          { text: "Plugin Options", link: "/customization/plugin-options" },
          {
            text: "Rendering Components",
            link: "/customization/rendering-components",
          },
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
  markdown: {
    codeTransformers: [
      transformerNotationDiff(),
      transformerNotationHighlight(),
      transformerNotationErrorLevel(),
      transformerNotationFocus(),
    ],
  },
  vite: {
    plugins: [viteTemplPreviewPlugin(vtpOptions)],
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
});
