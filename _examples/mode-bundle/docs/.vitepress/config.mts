import { defineConfig } from 'vitepress';
import viteTemplPreviewPlugin from 'vitepress-templ-preview';
import type { VTPUserConfig } from 'vitepress-templ-preview/types';

const vtpOptions: VTPUserConfig = {
  mode: 'bundle',
  goProjectDir: 'templ-preview',
  inputDir: 'demos',
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'vitepress-templ-preview',
  description:
    'A VitePress plugin to preview your templ components while documenting them.',
  lastUpdated: true,
  sitemap: {
    hostname: 'https://vitepress-templ-preview.indaco.dev',
  },
  themeConfig: {
    search: {
      provider: 'local',
    },

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Examples',
        items: [
          { text: 'Hello Templ', link: '/examples/hello' },
          { text: 'Button', link: '/examples/button' },
          { text: 'Alert', link: '/examples/alert' },
        ],
      },
    ],

    sidebar: [
      { text: 'Markdown Examples', link: '/markdown-examples' },
      {
        text: 'Examples',
        collapsed: false,
        items: [
          { text: 'Hello Templ', link: '/examples/hello' },
          { text: 'Button', link: '/examples/button' },
          { text: 'Alert', link: '/examples/alert' },
        ],
      },
    ],

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/indaco/vitepress-templ-preview',
      },
    ],

    editLink: {
      pattern:
        'https://github.com/indaco/vitepress-templ-preview/edit/main/website/docs/:path',
    },

    footer: {
      message:
        'Released under the <a href="https://github.com/indaco/vitepress-templ-preview#license">MIT License</a>.',
      copyright:
        'Copyright © 2024 <a href="https://github.com/indaco">Mirco Veltri</a>',
    },
  },
  markdown: {},
  vite: {
    plugins: [viteTemplPreviewPlugin(vtpOptions)],
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
});
