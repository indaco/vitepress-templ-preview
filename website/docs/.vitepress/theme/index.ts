import DefaultTheme from "vitepress/theme";
import { VPBadge } from "vitepress/theme";
import { VTPIconTabs } from "vitepress-templ-preview/components";
import "vitepress-templ-preview/style.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("templ-preview-component", VTPIconTabs);
    app.component(VPBadge);
  },
};
