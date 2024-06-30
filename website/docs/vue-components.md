# View Components

The `vitepress-templ-preview` plugin comes with some predefined components for preview rendering. Choose one and [register it](usage.html#vitepress).

::: details VTPCard

![VTPCard](/images/card.png)

:::

::: details VTPCollapsible

![VTPCollapsible](/images/collapsible.png)

:::

::: details VTPTabs

![VTPTabs](/images/tabs.png)

:::

## Props

These components expose certain properties to allow configuration:

| Prop          | Type            | Required | Default                                           | Description                                      |
| :------------ | :-------------- | :------- | ------------------------------------------------- | ------------------------------------------------ |
| `codeContent` | _string_        | Yes      |                                                   | The code content to display in the code tab.     |
| `htmlContent` | _string_        | Yes      |                                                   | The HTML content to display in the preview tab.  |
| `title`       | _string_        | Yes      |                                                   |                                                  |
| `themes`      | _BundledTheme_  | Yes      | `light: 'github-light'`<br/>`dark: 'github-dark'` | Shiki themes for syntax highlighting.            |
| `buttonStyle` | _"alt"/"brand"_ | Yes      | `alt`                                             | Show/hide code button style in `VTPCollpasible`. |

## Use a Custom Vew Component

If you are not satisfied with the predefined components and prefer to use your own custom one, it is easy to do so. Here is an example:

```vue
<script setup lang="ts">
import type { VTPComponentProps } from "vitepress-templ-plugin/types";
import {
  executeScriptsTick,
  useHighlighter,
} from "vitepress-templ-preview/shared";
import { onMounted, nextTick } from "vue";

const props = defineProps<VTPComponentProps>();
const { highlightedCode, highlightCode } = useHighlighter();

onMounted(async () => {
  await highlightCode(props.codeContent, props.themes);

  nextTick(() => {
    executeScriptsTick();
  });
});
</script>

<template>
  <h3 v-if="props.title !== ''" v-html="props.title"></h3>
  <div class="preview-content" v-html="props.htmlContent"></div>
  <div class="language-templ vp-adaptive-theme">
    <button title="Copy Code" class="copy"></button>
    <span class="lang">templ</span>
    <span class="vp-code" v-html="highlightedCode"></span>
  </div>
</template>
```

Remember to [register it](usage.html#vitepress).
