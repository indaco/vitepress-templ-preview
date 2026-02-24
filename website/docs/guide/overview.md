# What is it?

<VersionBadge />

`vitepress-templ-preview` enables live previews of [templ](https://templ.guide/) components directly within [VitePress](https://vitepress.dev/) projects.

## What's Inside?

- **Vite plugin** — processes custom tags in your markdown files and renders templ components as Vue components.
- **Vue components** — predefined components to display both the highlighted source code and the rendered preview.

## Features

- **Templ Syntax Highlighting** using [Shiki](https://shiki.style).
- **Automatic Generation** — runs `templ generate` via `static-templ` automatically. Can be disabled for manual control.
- **Hot Reloading** — re-generates and refreshes the page on templ file changes.
- **File Content Caching** — caches file contents to reduce redundant reads and improve performance.
- **Flexible Vue Components** — includes predefined rendering components, with support for custom ones.
