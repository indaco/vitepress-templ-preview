# Getting Started

Assuming you [scaffolded](https://vitepress.dev/guide/getting-started#installation) the VitePress project in `./docs`, the initial structure should look like this:

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

Add `vitepress-templ-preview` and its peer dependency `css-tree` to your project:

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

## VitePress Configuration

1. Register the plugin in `.vitepress/config.mts`.
2. Register a rendering component in `.vitepress/theme/index.ts` — either a [predefined one](/configuration/rendering-components.html) or a custom component.

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
> See [Plugin Options](/configuration/plugin-options.html) for available configuration.

### Search

The plugin provides a `sanitizeMarkdownForSearch` helper that strips `<templ-demo>` tags from the markdown source to prevent build errors with VitePress local search.

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
> `sanitizeMarkdownForSearch` accepts a fourth parameter for `inputDir`, if it has been set in the plugin options. See [Plugin Options](/configuration/plugin-options.html).

## Templ Project Setup

1. Initialize a Go module in the `docs` folder:

   ```bash
   cd docs
   go mod init components_demo
   go get github.com/a-h/templ
   ```

2. Create a `components/hello` folder with an `index.md` and a `hello-demo.templ` file:

   ```templ
   package hello

   templ HelloDemo() {
     @hello("World!!!")
   }

   templ hello(name string) {
     <div>Hello, { name }</div>
   }
   ```

Your project structure should now look like this:

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

Use the `templ-demo` tag to embed and preview a templ component in your markdown files.

Edit `components/hello/index.md`:

```html
<templ-demo src="hello-demo" />
```

> [!IMPORTANT]
> The `src` attribute is required. Set it to the templ file name **without** the extension.

For more options, see [Rendering Components](/configuration/rendering-components.html).

## Run the Project

Start the local dev server:

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

Visit the page for the **hello** component you just created. Your project is now up and running.
