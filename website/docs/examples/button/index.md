# Button component

Below, you will see the results produced by the `vitepress-templ-preview` plugin. For this example, we use the `data-preview-only` attribute on the tag to hide the `code` tab.

In this way, we are free to use the shikijs [transformers](https://shiki.style/packages/transformers).

```templ
templ ButtonDemo() {
  @button("Click me") // [!code focus]
}
```

<templ-demo src="button-demo" data-preview-only="true" />
