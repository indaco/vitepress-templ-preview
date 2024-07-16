import DefaultTheme from 'vitepress/theme';
import { VTPIconTabs } from 'vitepress-templ-preview/components';
import 'vitepress-templ-preview/style.css';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('VTPLivePreview', VTPIconTabs);
  },
};
