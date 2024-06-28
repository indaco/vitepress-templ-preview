# View Components

A Vue component for rendering tabbed code previews.

or self-closing tag work too:

```html
<templ-demo src="hello-demo" title="Simple Templ Component" />
```

You can set options to it (data-\* props are optionals):

```html
<templ-demo
  src="hello-demo"
  title="Simple Templ Component"
  data-button-variant="brand"
  data-theme-light="vitesse-light"
  data-theme-dark="vitesse-dark"
/>
```

## Props

| Prop          | Type            | Required | Default                                           | Description                                      |
| :------------ | :-------------- | :------- | ------------------------------------------------- | ------------------------------------------------ |
| `title`       | _string_        | No       |                                                   |                                                  |
| `codeContent` | _string_        | Yes      |                                                   | The code content to display in the code tab.     |
| `htmlContent` | _string_        | Yes      |                                                   | The HTML content to display in the preview tab.  |
| `themes`      | _ThemeOptions_  | No       | `light: 'github-light'`<br/>`dark: 'github-dark'` | Shiki themes for syntax highlighting.            |
| `buttonStyle` | _"alt"/"brand"_ | No       | `alt`                                             | Show/hide code button style in `VTPCollpasible`. |

## Slots

| Slot           | Default       | Description                      |
| :------------- | :------------ | -------------------------------- |
| `preview-icon` | `PreviewIcon` | Custom icon for the preview tab. |
| `code-icon`    | `CodeIcon`    | Custom icon for the code tab.    |
