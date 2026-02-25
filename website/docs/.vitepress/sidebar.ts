import { DefaultTheme } from 'vitepress';

export const sidebar: DefaultTheme.Config['sidebar'] = [
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
    ],
  },
  {
    text: 'Configuration',
    collapsed: false,
    items: [
      { text: 'Plugin Options', link: '/configuration/plugin-options' },
      {
        text: 'Rendering Components',
        link: '/configuration/rendering-components',
      },
    ],
  },
];
