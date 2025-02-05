import { defineConfig } from 'vitepress';
import {
  getVersionFromPackageJson,
  injectNPMPackageVersion,
} from '../src/plugins/injectVersion';

import type { VTPUserConfig } from 'vitepress-templ-preview/types';
import viteTemplPreviewPlugin from 'vitepress-templ-preview';
import { sanitizeMarkdownForSearch } from 'vitepress-templ-preview/sanitizer';

import {
  transformerNotationDiff,
  transformerNotationFocus,
} from '@shikijs/transformers';
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from 'vitepress-plugin-group-icons';

const vtpOptions: VTPUserConfig = {
  inputDir: 'examples',
};

const pkgVersion = getVersionFromPackageJson();

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'vitepress-templ-preview',
  description:
    'A VitePress plugin to preview your templ components while documenting them.',
  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/assets/favicons/logo-xs.svg',
      },
    ],
  ],
  lastUpdated: true,
  sitemap: {
    hostname: 'https://vitepress-templ-preview.indaco.dev',
  },
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        _render(src, env, md) {
          return sanitizeMarkdownForSearch(src, env, md, vtpOptions.inputDir!);
        },
      },
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
      {
        text: pkgVersion.replace(/\"/g, ''),
        items: [
          {
            text: 'Changelog',
            link: 'https://github.com/indaco/vitepress-templ-preview/blob/main/CHANGELOG.md',
            target: '_blank',
          },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Guide',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/guide/overview' },
          { text: 'Motivation', link: '/guide/motivation' },
          { text: 'Prerequisites', link: '/guide/prerequisites' },
          { text: 'Getting Started', link: '/guide/getting-started' },
        ],
      },
      {
        text: 'Examples',
        collapsed: false,
        items: [
          { text: 'Hello Templ', link: '/examples/hello/' },
          { text: 'Button', link: '/examples/button/' },
          { text: 'Alert', link: '/examples/alert/' },
          { text: 'Markdown Examples', link: '/examples/markdown-examples' },
        ],
      },
      {
        text: 'Customization',
        collapsed: false,
        items: [
          { text: 'Plugin Options', link: '/customization/plugin-options' },
          {
            text: 'Rendering Components',
            link: '/customization/rendering-components',
          },
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
        'Copyright © 2024 <a href="https://github.com/indaco">Mirco Veltri</a>.<br><span style="color: var(--vp-c-text-3); font-size: 12px;">The vitepress-templ-preview logo is a combination of elements from the Templ logo and the VitePress logo.<br/>All rights and licenses for these logos are owned by their respective creators.</span>',
    },
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin);
    },
    codeTransformers: [
      transformerNotationDiff({
        matchAlgorithm: 'v3',
      }),
      transformerNotationFocus({
        matchAlgorithm: 'v3',
      }),
    ],
  },
  vite: {
    plugins: [
      injectNPMPackageVersion(pkgVersion),
      viteTemplPreviewPlugin(vtpOptions),
      groupIconVitePlugin({
        customIcon: {
          '.mts': 'vscode-icons:file-type-typescript',
        },
      }),
    ],
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
});
