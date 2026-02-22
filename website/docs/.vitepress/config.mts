import { defineConfig } from 'vitepress';
import {
  getVersionFromPackageJson,
  injectNPMPackageVersion,
} from '../src/plugins/injectVersion';

import viteTemplPreviewPlugin from 'vitepress-templ-preview';
import { sanitizeMarkdownForSearch } from 'vitepress-templ-preview/sanitizer';
import type { VTPUserConfig } from 'vitepress-templ-preview/types';

import {
  transformerNotationDiff,
  transformerNotationFocus,
} from '@shikijs/transformers';
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from 'vitepress-plugin-group-icons';

import { nav } from './nav';
import { sidebar } from './sidebar';

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
  // Use .html on URLs
  cleanUrls: false,
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        detailedView: true,
        _render(src, env, md) {
          return sanitizeMarkdownForSearch(src, env, md, vtpOptions.inputDir!);
        },
      },
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: nav,

    sidebar: sidebar,

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
      message: 'Released under the MIT License</a>.',
      copyright:
        "Copyright © 2024 - current <a href='https://github.com/indaco' target='_blank'>indaco</a> .<br><span style='color: var(--vp-c-text-3); font-size: 12px;'>The vitepress-templ-preview logo is a combination of elements from the Templ logo and the VitePress logo.<br/>All rights and licenses for these logos are owned by their respective creators.</span>",
    },
  },
  markdown: {
    image: {
      lazyLoading: true,
    },
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
