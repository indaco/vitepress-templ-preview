# APIs

## viteTemplPreviewPlugin

| Option       | Type      | Default         | Description                                                                               |
| :----------- | :-------- | :-------------- | ----------------------------------------------------------------------------------------- |
| `projectDir` | _string_  | `templ-preview` | The base directory where your `templ` project is located.                                 |
| `inputDir`   | _string_  | `demos`         | The directory relative to the `projectDir` where your ".templ" files are located.         |
| `outputDir`  | _string_  | `output`        | The directory relative to the `projectDir` where the generated HTML files will be placed. |
| `debug`      | _boolean_ | `false`         | Whether or not to keep the `static-templ` generation script after completion.             |
