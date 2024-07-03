import DefaultTheme from "vitepress/theme";
import { VTPIconTabs } from "vitepress-templ-preview/ui";
import "vitepress-templ-preview/ui/style.css";

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component("templ-preview-component", VTPIconTabs);
  },
};
