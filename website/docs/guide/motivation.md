# Motivation

## The Challenge

[templ](https://templ.guide/) is a powerful way to build HTML components with Go. In a Go environment, running `templ generate` converts `*.templ` files into Go code and fits naturally into the development workflow.

However, documenting templ components in a JavaScript/TypeScript tool like [VitePress](https://vitepress.dev/) introduces friction: manual generation steps, no live previews, and no hot reloading.

## The Solution

This plugin bridges templ and VitePress by automating the generation and preview process. It handles `templ generate` behind the scenes, watches for file changes, and updates the documentation automatically — bringing the simplicity of the Go workflow into VitePress.
