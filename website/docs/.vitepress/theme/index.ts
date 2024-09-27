import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import VersionBadge from '../../src/components/VersionBadge.vue';
import { VTPIconTabs } from 'vitepress-templ-preview/components';
import 'vitepress-templ-preview/style.css';
import 'virtual:group-icons.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('VersionBadge', VersionBadge);
    /* Make sure to name the tag  `VTPLivePreview` */
    app.component('VTPLivePreview', VTPIconTabs);
  },
} satisfies Theme;
