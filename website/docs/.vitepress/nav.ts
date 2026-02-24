import { DefaultTheme } from 'vitepress';
import { getVersionFromPackageJson } from '../src/plugins/injectVersion';

const pkgVersion = getVersionFromPackageJson();

export const nav: DefaultTheme.Config['nav'] = [
  { text: 'Home', link: '/' },
  { text: 'Guide', link: '/guide/overview' },
  {
    text: 'Configuration',
    items: [
      { text: 'Plugin Options', link: '/configuration/plugin-options' },
      {
        text: 'Rendering Components',
        link: '/configuration/rendering-components',
      },
    ],
  },
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
];
