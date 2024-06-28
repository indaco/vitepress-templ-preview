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

### 1. Setup a new templ project

1. Create a `templ-preview` folder within `./docs` containing your templ project.
2. Initialize a new Go project within it as you do for a normal `templ` project, refer to the [official doc](https://templ.guide/quick-start/creating-a-simple-templ-component).

   ```bash
   cd templ-preview
   go mod init templ-preview
   go get github.com/a-h/templ
   ```

3. Create a `demos` folder to store your `templ` files

The resulting project structure could look like this:

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

::: info
Please, refer to the [Plugin Options](/options) to see the available options for the plugin.
:::

### 2. Configure VitePress

First, you need to configure the plugin in your VitePress project. Edit your VitePress config file (`.vitepress/config.js` or `.vitepress/config.mts`):

```ts{3}
// .vitepress/config.mts
import { defineConfig } from "vitepress";
import viteTemplPreviewPlugin from "vitepress-templ-preview";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  /* ... */
  vite: {
    plugins: [viteTemplPreviewPlugin()],
  }
  /* ... */
});
```

### 3. Register the Vue component

You can choose from 3 predefined Vue components or [Use a custom component](#custom-component) for snippets rendering:

Ensure to register the component in your app. Create or edit `.vitepress/theme/index.js` or `.vitepress/theme/index.ts`:

```typescript
// .vitepress/theme/index.ts
import DefaultTheme from "vitepress/theme";
import { VTPTabs } from "vitepress-templ-preview/ui";
import "vitepress-templ-preview/ui/style.css";

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {},
};
```

### 4. Use the code block in the markdown

Next, use the `templ-preview` tag in your markdown files:

```html
<templ-demo src="hello-demo" title="Simple Templ Component"></templ-demo>
```
