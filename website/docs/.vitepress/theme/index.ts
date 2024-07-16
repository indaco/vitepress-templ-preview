import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { VPBadge } from 'vitepress/theme';
import { VTPIconTabs } from 'vitepress-templ-preview/components';
import 'vitepress-templ-preview/style.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Badge', VPBadge);
    /* Make sure to name the tag  `VTPLivePreview` */
    app.component('VTPLivePreview', VTPIconTabs);
  },
} satisfies Theme;
