# Overview

This package offers a solution for [templ](https://templ.guide/) component previews within [VitePress](https://vitepress.dev/) projects. It includes:

- **viteTemplPreviewPlugin**: A Vite plugin designed to handle templ components in your markdown files. This plugin processes these tags and renders a Vue component to display both the highlighted source code and the rendered preview of the templ component.
- **Vue components**: Three predefined Vue components tailored for component preview purposes.

## :sparkles: Features

- **Templ Syntax Highlighting**: Provides syntax highlighting for `templ` files using [shiki-templ](https://github.com/indaco/shiki-templ).
- **Automatic Generation**: Runs `templ generate` command via `static-templ` at server startup, eliminating the need to run this command manually.
- **Hot Reloading**: Automatically triggers the `templ generate` command and command and refresh the page to display the new content.
- **File Content Caching**: Efficiently caches file contents to improve performance and reduce redundant file reads.
- **Flexible Vue Components**: Includes three predefined Vue components for rendering previews, with the option to use custom components.
