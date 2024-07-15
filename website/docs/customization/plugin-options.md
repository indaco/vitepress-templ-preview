# viteTemplPreviewPlugin Options

The following table lists the configurable options for the `viteTemplPreviewPlugin`. These options allow you to customize the plugin's behavior according to your project needs:

| Option             | Type      | Default  | Description                                                                               |
| :----------------- | :-------- | :------- | ----------------------------------------------------------------------------------------- |
| `goProjectDir`     | _string_  | ``       | The base directory where your Go `templ` project is located.                              |
| `mode`             | _string_  | `inline` | The working mode for the plugin: either `inline` or `bundle`.                             |
| `inputDir`         | _string_  | `demos`  | The directory relative to the `projectDir` where your `.templ` files are located.         |
| `outputDir`        | _string_  | `output` | The directory relative to the `projectDir` where the generated HTML files will be placed. |
| `debug`            | _boolean_ | `false`  | Whether or not to keep the `static-templ` generation script after completion.             |
| `runTemplGenerate` | _boolean_ | `true`   | Whether the plugin should run the `templ generate` command for you.                       |

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
        // goProjectDir: "preview"
        // mode: "inline"
        // inputDir: "templ-files"
        // outputDir: "html-files"
        // debug: true
        // runTemplGenerate: true
      }),
    ],
  },
  /* ... */
});
```
