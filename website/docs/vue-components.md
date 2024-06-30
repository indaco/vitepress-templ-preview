# View Components

`vitepress-templ-preview` plugin comes with 3 predefined components for preview rendering. Choose one and [register it](usage.html#vitepress).

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
| `title`       | _string_        | No       |                                                   |                                                  |
| `themes`      | _BundledTheme_  | No       | `light: 'github-light'`<br/>`dark: 'github-dark'` | Shiki themes for syntax highlighting.            |
| `buttonStyle` | _"alt"/"brand"_ | No       | `alt`                                             | Show/hide code button style in `VTPCollpasible`. |

## Use a Custom Vew Component
