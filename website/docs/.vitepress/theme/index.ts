import DefaultTheme from "vitepress/theme";
import { VTPCollapsible } from "vitepress-templ-preview/ui";
import "./styles.css";
import "vitepress-templ-preview/ui/style.css";

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component("templ-preview-component", VTPCollapsible);
  },
};
