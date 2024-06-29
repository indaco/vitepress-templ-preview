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

Those components exposed some properties to allow configuration

| Prop          | Type            | Required | Default                                           | Description                                      |
| :------------ | :-------------- | :------- | ------------------------------------------------- | ------------------------------------------------ |
| `title`       | _string_        | No       |                                                   |                                                  |
| `codeContent` | _string_        | Yes      |                                                   | The code content to display in the code tab.     |
| `htmlContent` | _string_        | Yes      |                                                   | The HTML content to display in the preview tab.  |
| `themes`      | _BundledTheme_  | No       | `light: 'github-light'`<br/>`dark: 'github-dark'` | Shiki themes for syntax highlighting.            |
| `buttonStyle` | _"alt"/"brand"_ | No       | `alt`                                             | Show/hide code button style in `VTPCollpasible`. |

## Component configuration in markdown files

You can set options on in by passing `data` properties on the tag itself:

```html
<templ-demo
  src="hello-demo"
  title="Hello Templ Demo"
  data-button-variant="brand"
  data-theme-light="vitesse-light"
  data-theme-dark="vitesse-dark"
/>
```

## Slots

| Slot           | Default       | Description                      |
| :------------- | :------------ | -------------------------------- |
| `preview-icon` | `PreviewIcon` | Custom icon for the preview tab. |
| `code-icon`    | `CodeIcon`    | Custom icon for the code tab.    |
