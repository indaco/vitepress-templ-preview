# bundle-mode-website

This is a sample project to showcase how the `mode=bundle` works for the plugin.

```ts
//./vitepress/config.mts
const vtpOptions: VTPUserConfig = {
  mode: "bundle",
  goProjectDir: "templ-preview",
  inputDir: "demos",
};
```

## Prerequisites

```bash
go install github.com/indaco/static-templ-plus@latest
```

## Usage

```bash
npm install

npm run docs:dev
```

Visit the "Templ Preview Demo" page.
