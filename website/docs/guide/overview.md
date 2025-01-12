# What is it?

<VersionBadge />

`vitepress-templ-preview` offers a solution for [templ](https://templ.guide/) component previews within [VitePress](https://vitepress.dev/) projects.

## 📦 What’s Inside?

- **Vite plugin**: designed to handle templ components in your markdown files. This plugin processes custom tags and renders them as Vue components.
- **Vue components**: Predefined Vue components tailored to display both the highlighted source code and the rendered preview of the templ component.

## :sparkles: Features

- **Templ Syntax Highlighting**: syntax highlighting for `templ` using [shiki](https://shiki.style).
- **Automatic Generation**: Runs `templ generate` command via `static-templ-plus`, removing the need to run the command manually. This feature can be disabled, allowing you to run the templ generate command manually.
- **Hot Reloading**: Automatically triggers the `templ generate` command and refreshes the page to display the updated content.
- **File Content Caching**: Efficiently caches file contents to improve performance and reduce redundant file reads.
- **Flexible Vue Components**: Includes predefined Vue components for rendering previews, with the option to use custom components.
