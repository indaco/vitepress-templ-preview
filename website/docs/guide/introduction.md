# Introduction

This package offers a solution for [templ](https://templ.guide/) component previews within [VitePress](https://vitepress.dev/) projects.

## 📦 What’s Inside?

- **_viteTemplPreviewPlugin_**: A Vite plugin designed to handle templ components in your markdown files. This plugin processes custom tag and renders a Vue component.
- **Vue components**: Predefined Vue components tailored to display both the highlighted source code and the rendered preview of the templ component.

## :sparkles: Features

- **Templ Syntax Highlighting**: syntax highlighting for `templ` using [shiki](https://shiki.style).
- **Automatic Generation**: Runs `templ generate` command via `static-templ-plus`, eliminating the need to run this command manually.
- **Hot Reloading**: Automatically triggers the `templ generate` command and refresh the page to display the new content.
- **File Content Caching**: Efficiently caches file contents to improve performance and reduce redundant file reads when in `dev` mode.
- **Flexible Vue Components**: Includes predefined Vue components for rendering previews, with the option to use custom components.
