# Usage

## Installation

```bash
# npm
npm install -D vitepress-templ-preview
# yarn
yarn add -D vitepress-templ-preview
#pnpm
pnpm add -D vitepress-templ-preview
```

Assuming you chose to scaffold the VitePress project in `./docs`, the initial generated file structure should look like this:

```bash
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
└─ package.json
```

## Setup

The plugin supports two ways of working reflecting the `static-templ-plus` [modes](https://github.com/indaco/static-templ-plus/tree/op-modes?tab=readme-ov-file#modes). The result is the same in both cases. The choice depends on your preferences for content management and resulting URLs.

> [!TIP]
> Please, refer to the [Plugin Options](/customization/plugin-options) to see the available options for the plugin.

### Inline mode

> [!INFO]
> This website is built in `inline` mode. The code is available in the GitHub repository and can be used as a reference.

This is the **default** method. It involves setting up a Go module project in the **root** folder of your VitePress project with the templ files alongside your markdown content files.

> The resulting URLs are in the form of `/components/button` or `/components/dropdown`.

At the end, your project structure should look like this:

```bash{8-18}
.
├── docs
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  ├─ index.md
│  ├─ components
│  │  ├─ button
│  │  │  ├─ button-demo.templ
│  │  │  └─ index.md
│  │  ├─ dropdown
│  │  │  ├─ dropdown-demo.templ
│  │  │  └─ index.md
│  ├─ go.mod
│  ├─ go.sum
└─ package.json
```

### Bundle mode

> [!INFO]
> If you are interested in this working mode, there is a sample project in the GitHub repository that can be used as a reference. Check it out [here](https://github.com/indaco/vitepress-templ-preview/_examples/).

This method involves setting up a new Go module project within your VitePress project.

> The resulting URLs are in the form of `/components/button.html` or `/components/dropdown.html`.

1. Create a `templ-preview` folder within `./docs` containing your templ project.
2. Initialize a new Go project within it as you would for a normal `templ` project. Refer to the [official doc](https://templ.guide/quick-start/creating-a-simple-templ-component).

   ```bash
   cd templ-preview
   go mod init templ-preview
   go get github.com/a-h/templ
   ```

3. Create a `demos` folder to store your `templ` files

The resulting project structure should look like this:

```bash{11-16}
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  ├─ components
│  │  └─ button.md
│  │  └─ dropdown.md
│  └─ index.md
│  ├─ templ-preview
│  │  └─ demos
│  │     └─ button-demo.templ
│  │     └─ dropdown-demo.templ
│  │  └─ go.mod
│  │  └─ go.sum
└─ package.json
```

### VitePress

1. Configure the plugin in your VitePress project by editing the VitePress config file (`.vitepress/config.js` or `.vitepress/config.mts`)
2. Register the rendering component: choose a predefined Vue component or [Use a custom component](/customization/rendering-components); Create or edit `.vitepress/theme/index.js` or `.vitepress/theme/index.ts`

::: code-group

```ts{3,8} [config.mts]
// .vitepress/config.mts
import { defineConfig } from "vitepress";
import viteTemplPreviewPlugin from "vitepress-templ-preview";

export default defineConfig({
  /* ... */
  vite: {
    plugins: [viteTemplPreviewPlugin()],
  }
  /* ... */
});
```

```ts{3,4,9-13} [theme/index.ts]
//.vitepress/theme/index.ts
import DefaultTheme from "vitepress/theme";
import { VTPCollapsible } from "vitepress-templ-preview/components";
import "vitepress-templ-preview/style.css";

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    /**
     * You must write "component" rather that "componen"
     * It is not a typo but using "component", raise an error.
     */
    app.component("templ-preview-componen", VTPCollapsible);
  },
};
```

:::

## Templ Components in Markdown

To embed and preview a `templ` component, in your markdown files use the `templ-demo` tag as follows:

```html
<templ-demo src="hello-demo" />
```

Alternatively, you can use the self-closing format:

```html
<templ-demo src="hello-demo"></templ-demo>
```

> [!IMPORTANT]
> The `src` property is the only mandatory attribute. It must be set to the `templ` file name **without** the extension.

For more information on the available options for rendering components via the custom `templ-demo` tag, refer to the [Rendering Components documentation](/customization/rendering-components).
