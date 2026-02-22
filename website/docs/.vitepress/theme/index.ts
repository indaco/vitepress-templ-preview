import 'virtual:group-icons.css';
import type { Theme } from 'vitepress';
import { VTPIconTabs } from 'vitepress-templ-preview/components';
import 'vitepress-templ-preview/style.css';
import DefaultTheme from 'vitepress/theme';

import VersionBadge from '../../src/components/VersionBadge.vue';
import HomeFeatures from './components/HomeFeatures.vue';

import { h } from 'vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'home-hero-after': () => h(HomeFeatures),
    });
  },
  enhanceApp({ app }) {
    app.component('VersionBadge', VersionBadge);
    /* Make sure to name the tag  `VTPLivePreview` */
    app.component('VTPLivePreview', VTPIconTabs);
  },
} satisfies Theme;
