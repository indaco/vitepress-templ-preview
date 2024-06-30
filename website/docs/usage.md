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

### templ project

1. Create a `templ-preview` folder within `./docs` containing your templ project.
2. Initialize a new Go project within it as you do for a normal `templ` project, refer to the [official doc](https://templ.guide/quick-start/creating-a-simple-templ-component).

   ```bash
   cd templ-preview
   go mod init templ-preview
   go get github.com/a-h/templ
   ```

3. Create a `demos` folder to store your `templ` files

The resulting project structure should look like this:

```bash{8-12}
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
│  ├─ templ-preview
│  │  └─ demos
│  │     └─ hello-demo.templ
│  │  └─ go.mod
│  │  └─ go.sum
└─ package.json
```

> [!TIP]
> Please, refer to the [Plugin Options](/options) to see the available options for the plugin.

### VitePress

1. Configure the plugin in your VitePress project. Edit your VitePress config file (`.vitepress/config.js` or `.vitepress/config.mts`)
2. Register the Vue component: choose a predefined Vue components or [Use a custom component](/custom-vue-component); Create or edit `.vitepress/theme/index.js` or `.vitepress/theme/index.ts`

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

```ts{2,3,8-12} [theme/index.ts]
//.vitepress/theme/index.ts
import DefaultTheme from "vitepress/theme";
import { VTPTabs } from "vitepress-templ-preview/ui";
import "vitepress-templ-preview/ui/style.css";

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

### Use the code block in the markdown

Next, use the `templ-preview` tag in your markdown files:

```html
<templ-demo src="hello-demo" />
```

or

```html
<templ-demo src="hello-demo"></templ-demo>
```

### Component configuration

You can configure the component passing `data` properties to the tag itself. All `data-*` properties are optionals:

```html
<templ-demo
  src="hello-demo"
  data-title="Hello Templ Demo"
  data-button-variant="brand"
  data-theme-light="vitesse-light"
  data-theme-dark="vitesse-dark"
/>
```

> [!TIP]
> Check the [Vue Components](/vue-components) page to know more.
