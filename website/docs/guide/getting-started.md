# Quick Start

Assuming you chose to [scaffold](https://vitepress.dev/guide/getting-started#installation) the VitePress project in `./docs`, the initial generated file structure should look like this:

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

## Installation

Add `vitepress-templ-preview` to your VitePress project along with its peer dependency `css-tree`, using one of the following commands:

::: code-group

```bash [npm]
npm add -D vitepress-templ-preview css-tree
```

```bash [pnpm]
pnpm add -D vitepress-templ-preview css-tree
```

```bash [yarn]
yarn add -D vitepress-templ-preview css-tree
```

:::

## VitePress configuration

1. Configure the plugin in your VitePress project by editing the VitePress config file (`.vitepress/config.js` or `.vitepress/config.mts`)
2. Register the rendering component: choose a predefined Vue component or [Use a custom component](/customization/rendering-components); Create or edit `.vitepress/theme/index.js` or `.vitepress/theme/index.ts`

::: code-group

```ts [config.mts]
// .vitepress/config.mts
import { defineConfig } from "vitepress";
import viteTemplPreviewPlugin from "vitepress-templ-preview"; // [!code ++]

export default defineConfig({
  /* ... */
  markdown: {}, // [!code ++]
  vite: {
    plugins: [viteTemplPreviewPlugin()], // [!code ++]
  },
  /* ... */
});
```

```ts [theme/index.ts]
//.vitepress/theme/index.ts
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { VTPIconTabs } from "vitepress-templ-preview/components"; // [!code ++]
import "vitepress-templ-preview/style.css"; // [!code ++]

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    /* Make sure to name the tag  `VTPLivePreview` */
    app.component("VTPLivePreview", VTPIconTabs); // [!code ++]
  },
} satisfies Theme;
```

:::

> [!INFO]
> Please, refer to the [Plugin Options](/customization/plugin-options) to see the available options for the plugin.

### Search

Define a custom `_render` function to preprocess the Markdown content and remove `<templ-demo>` tags from the Markdown source to prevent build errors.

The `vitepress-templ-preview` plugin provides a `sanitizeMarkdownForSearch` helper to streamline this process.

```ts [config.mts]
import { sanitizeMarkdownForSearch } from 'vitepress-templ-preview/sanitizer'; // [!code ++]

export default defineConfig({
  /* ... */
  themeConfig: {
      search: {
        provider: 'local',
        options: {
          _render(src, env, md) {
            sanitizeMarkdownForSearch(src, env, md) // [!code ++]
          },
        },
      },
      /* ... */
    });
  /* ... */
});
```

> [!IMPORTANT]
> Additionally, `renderForLocalSearch` accepts a fourth parameter to specify the `inputDir`, if it has been set in the plugin options. For details, refer to the [Plugin Options](/customization/plugin-options).

## Templ Project Setup

1. Initialize a new Go project within the VitePress project root folder `docs` as you would for a normal `templ` project. Refer to the [official doc](https://templ.guide/quick-start/creating-a-simple-templ-component).

   ```bash
   cd docs
   go mod init components_demo
   go get github.com/a-h/templ
   ```

2. Create a `components` folder within `./docs`.
3. Create a `hello` folder to store both the markdown and the `templ` files for the demos:

   - Create an `index.md` file
   - Create a `hello-demo.templ` file with some `templ` code:

     ```templ
     package hello

     templ HelloDemo() {
       @hello("World!!!")
     }

     templ hello(name string) {
       <div>Hello, { name }</div>
     }
     ```

Your project structure should look like this:

```bash{8-13}
.
├── docs
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  ├─ index.md
│  ├─ components
│  │  ├─ hello
│  │  │  ├─ hello-demo.templ
│  │  │  └─ index.md
│  ├─ go.mod
│  ├─ go.sum
└─ package.json
```

## Embed in Markdown

To embed and preview a `templ` component in your markdown files, use the `templ-demo` tag.

Edit the `components/hello/index.md` file by adding:

```html
<templ-demo src="hello-demo"></templ-demo>
```

Alternatively, you can use the self-closing format:

```html
<templ-demo src="hello-demo" />
```

> [!IMPORTANT]
> The `src` property is the only mandatory attribute. It must be set to the `templ` file name **without** the extension.

For more information on the available options for rendering components via the custom `templ-demo` tag, refer to the [Rendering Components documentation](/customization/rendering-components).

## Run the project

Based on your initial configuration, the npm scripts might already be set in the `package.json` file.

To start the local dev server, use one of the following commands:

::: code-group

```bash [npm]
npm run docs:dev
```

```bash [pnpm]
pnpm run docs:dev
```

```bash [yarn]
yarn docs:dev
```

:::

Visit the page for the **hello** component you just created.

Your project is now up and running. Enjoy! :heart:
