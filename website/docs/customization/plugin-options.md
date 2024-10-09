# viteTemplPreviewPlugin

The plugin supports two modes of operation, reflecting the `static-templ` [modes](https://github.com/nokacper24/static-templ?tab=readme-ov-file#modes). The resulting output is the same in both cases, but the choice depends on your preferences for content management and resulting URLs.

## Inline Mode

This is the **default** method. It involves setting up a Go module project in the **root** folder of your VitePress project, with the templ files alongside your markdown content files.

> The resulting URLs will be in the form of `/components/button` or `/components/dropdown`.

1. Initialize a new Go project within the VitePress project root folder `docs` as you would for a normal `templ` project. Refer to the [official documentation](https://templ.guide/quick-start/creating-a-simple-templ-component).

   ```bash
   cd docs
   go mod init components_demo
   go get github.com/a-h/templ
   ```

2. Create a `components` folder within `./docs` and structure your documentation pages accordingly.

The resulting project structure should look like this:

```bash{8-16}
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

> [!TIP]
> This website is built using `inline` mode. The code is available in the GitHub repository and can be used as a reference.

### Bundle mode

This method involves setting up a new Go module project in a subfolder of your VitePress project.

> The resulting URLs will be in the form of `/components/button.html` or `/components/dropdown.html`.

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

> [!TIP]
> If you are interested in `bundle` working mode, there is a sample project in the GitHub repository that you can use as a reference. Check it out [here](https://github.com/indaco/vitepress-templ-preview/_examples/).

## Options

The following table lists the configurable options for the `viteTemplPreviewPlugin`. These options allow you to customize the plugin's behavior according to your project's needs. Most of these options are the same as those accepted by `static-templ`.

| Option             | Type      | Default      | Description                                                                                                |
| :----------------- | :-------- | :----------- | ---------------------------------------------------------------------------------------------------------- |
| `goProjectDir`     | _string_  | `.`          | The base directory where your Go `templ` project is located. Default to the vitepress project root folder. |
| `mode`             | _string_  | `inline`     | The working mode for the plugin: `inline` or `bundle`.                                                     |
| `inputDir`         | _string_  | `components` | The directory relative to `goProjectDir` where your `.templ` files are located.                            |
| `outputDir`        | _string_  | `output`     | The directory relative to `goProjectDir` where the generated HTML files will be placed.                    |
| `debug`            | _boolean_ | `false`      | Whether or not to keep the `static-templ` generation script after completion.                              |
| `runTemplGenerate` | _boolean_ | `true`       | Whether the plugin should run the `templ generate` command for you.                                        |
| `cacheSize`        | _number_  | `100`        | The maximum number of files to cache.                                                                      |

To configure these options, set the values in your VitePress configuration file as shown below:

```ts
// .vitepress/config.mts
import { defineConfig } from "vitepress";
import viteTemplPreviewPlugin from "vitepress-templ-preview";

export default defineConfig({
  /* ... */
  vite: {
    plugins: [
      viteTemplPreviewPlugin({
        // goProjectDir: "",
        // mode: "inline",
        // inputDir: "components",
        // outputDir: "output",
        // debug: false,
        // runTemplGenerate: true,
        // cacheSize: 100,
      }),
    ],
  },
  /* ... */
});
```
