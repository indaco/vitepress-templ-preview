# Overview

This package offers a solution for [templ](https://templ.guide/) component previews within [VitePress](https://vitepress.dev/) projects.

## Motivation

Creating and maintaining a seamless workflow for developing and documenting templ components can be challenging, especially when manual steps are required to generate and preview components. This plugin was developed to simplify and enhance the process of documenting templ components within VitePress, offering an automated, efficient solution.

### The Challenges

templ is a powerful tool that allows you to build HTML with Go, creating components that render fragments of HTML to compose screens, pages, documents, or apps. However, using templ in a Go web application requires running `templ generate` to convert `*.templ` files into Go code. Every time you modify a `*.templ` file, you must manually re-run the generation command to see the changes reflected.

VitePress, on the other hand, is a Static Site Generator (SSG) designed for building fast, content-centric websites. It processes Markdown source content, applies themes, and generates static HTML pages. While it excels at creating static sites, integrating the dynamic generation of templ components can be cumbersome without automation.

### The Solution

This plugin bridges the gap between templ and VitePress, automating the generation and preview of templ components. By integrating directly with VitePress, the plugin handles the necessary templ generation steps behind the scenes, ensuring that any changes to `*.templ` files are automatically processed and reflected in the documentation.

## 📦 What’s Inside?

- **viteTemplPreviewPlugin**: A Vite plugin designed to handle templ components in your markdown files. This plugin processes specific html tags and renders a Vue component to display both the highlighted source code and the rendered preview of the templ component.
- **Vue components**: Predefined Vue components tailored for component preview purposes.

## :sparkles: Features

- **Templ Syntax Highlighting**: Provides syntax highlighting for `templ` files using [shiki-templ](https://github.com/indaco/shiki-templ).
- **Automatic Generation**: Runs `templ generate` command via `static-templ` at server startup, eliminating the need to run this command manually.
- **Hot Reloading**: Automatically triggers the `templ generate` command and command and refresh the page to display the new content.
- **File Content Caching**: Efficiently caches file contents to improve performance and reduce redundant file reads.
- **Flexible Vue Components**: Includes predefined Vue components for rendering previews, with the option to use custom components.
