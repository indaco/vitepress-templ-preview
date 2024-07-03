# View Components

The `vitepress-templ-preview` plugin comes with some predefined components you can select for preview rendering:

- _VTPCard_
- _VTPCollapsible_
- _VTPTabs_

Choose one and [register](/guide/usage.html#vitepress) it.

## Shared Properties

All these components expose certain properties to allow configuration:

| Prop          | Type           | Default                                           | Description                                     |
| :------------ | :------------- | ------------------------------------------------- | ----------------------------------------------- |
| `codeContent` | _string_       |                                                   | The code content to display in the code tab.    |
| `htmlContent` | _string_       |                                                   | The HTML content to display in the preview tab. |
| `title`       | _string_       |                                                   |                                                 |
| `themes`      | _BundledTheme_ | `light: 'github-light'`<br/>`dark: 'github-dark'` | Shiki themes for syntax highlighting.           |

## Component Specific Properties

### VTPCard

| Prop             | Type      | Default | Description                                       |
| :--------------- | :-------- | ------- | ------------------------------------------------- |
| `isPreviewFirst` | _boolean_ | `true`  | Wheather or not show the preview before the code. |

::: details Screenshot

![VTPCard](/images/card.png)

:::

### VTPCollapsible

| Prop          | Type            | Default | Description                                      |
| :------------ | :-------------- | ------- | ------------------------------------------------ |
| `buttonStyle` | _"alt"/"brand"_ | `alt`   | Show/hide code button style in `VTPCollpasible`. |

::: details Screenshot

![VTPCollapsible](/images/collapsible.png)

:::

### VTPTabs

::: details Screenshot

![VTPTabs](/images/tabs.png)

:::

## Use a Custom Vue Component

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

<style scoped>
/* Your CSS here */
</style>
```

Remember to [register](/guide/usage.html#vitepress) it.
