<h1 align="center" style="font-size: 2.5rem;">vitepress-templ-preview</h1>
<h2 align="center">A VitePress plugin to preview your templ components while documenting them.</h2>
<p align="center">
    <a href="https://www.npmjs.com/package/vitepress-templ-preview" target="_blank"><img src="https://img.shields.io/npm/v/vitepress-templ-preview.svg?style=flat" alt="NPM Package" /></a>
    <a href="https://github.com/indaco/vitepress-templ-preview/blob/main/LICENSE" target="_blank">
        <img src="https://img.shields.io/badge/license-mit-blue?style=flat-square&logo=none" alt="license" />
    </a>
</p>

## Documentation

Check out the docs [here](https://vitepress-templ-preview.indaco.dev).

## Contributing

We welcome contributions! Whether it's reporting a bug, suggesting a feature, or submitting a pull request, your input helps improve this project.

### Known Issues

When running `pnpm web:dev` to start the sample website, you might encounter the following error:

```bash
> vitepress dev docs

failed to load config from /Users/indaco/Code/GitHub/indaco/vitepress-templ-preview/website/docs/.vitepress/config.mts
failed to start server. error:
Cannot find module '../data/patch.json'
Require stack:
- /Users/indaco/Code/GitHub/indaco/vitepress-templ-preview/package/dist/plugin/index.esm.js
Error: Cannot find module '../data/patch.json'
```

**Cause**

This issue is related to the `css-tree` package. The root cause seems to stem from how module exports are defined in its package.json.

**Workaround**

You can resolve this issue by modifying the exports field in node_modules/css-tree/package.json. Specifically, update the first exports entry like so:

```json
  "exports": {
    ".": {
-     "import": "./lib/index.js",
+     "import": "./cjs/index.cjs",
      "require": "./cjs/index.cjs"
    },
   ...
```

This workaround was discussed in [bun/issues/13076](https://github.com/oven-sh/bun/issues/13076#issuecomment-2550735879).

**Note**

While this is a temporary fix, keep an eye on updates to css-tree or related dependencies for a permanent resolution. If you encounter additional issues or have insights into fixing this differently, feel free to open an issue!

## License

This project is licensed under the MIT License - see the LICENSE file for details.

### Acknowledgements

This project makes use of [static-templ](https://github.com/nokacper24/static-templ), which is licensed under the GNU General Public License (GPL). Users of this project must comply with the terms of the GPL license when using static-templ. Refer to the [static-templ repository](https://github.com/nokacper24/static-templ) for more information on its licensing terms.
