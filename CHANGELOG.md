# Changelog

All notable changes to this project will be documented in this file.

The format adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html),
and is generated by [changelogen](https://github.com/unjs/changelogen) and managed with [Changie](https://github.com/miniscruff/changie).

## v0.3.0 - 2025-01-12

[compare changes](https://github.com/indaco/vitepress-templ-preview/compare/v0.2.0...v0.3.0)

This release focuses on addressing two key requirements:

1. **CSS `@layer` Priority Adjustment:**
   When defining component styles using CSS `@layer`, these styles previously had a lower priority compared to the default VitePress styles applied to elements like `<button>`. The `HtmlStyleOptimizer` has been enhanced to properly extract CSS from `@layers` and reapply these styles with the same specificity as VitePress's default styles.

2. **Markdown Content Sanitization:**
   A [custom content renderer](https://vitepress.dev/reference/default-theme-search#custom-content-renderer) is provided to sanitize Markdown content and ensure proper processing by VitePress’s search plugin. For more details, refer to the [updated documentation](https://vitepress-templ-preview.indaco.dev/guide/getting-started.html#vitepress-configuration).

### 🚀 Enhancements

- **plugin:** CSS layer extractor ([86f53dd](https://github.com/indaco/vitepress-templ-preview/commit/86f53dd))
- **plugin:** Add `sanitizeMarkdownForSearch` to preprocess Markdown for vitepress search ([c57bdac](https://github.com/indaco/vitepress-templ-preview/commit/c57bdac))
- **plugin:** Mark `css-tree` as a peer dependency. Updated documentation ([e2c5701](https://github.com/indaco/vitepress-templ-preview/commit/e2c5701))

### 🔥 Performance

- **plugin:** Better modularity and batch reading/writing HTML files ([57c759a](https://github.com/indaco/vitepress-templ-preview/commit/57c759a))

### 🩹 Fixes

- CleanStyleTags and methods visibility ([8acad36](https://github.com/indaco/vitepress-templ-preview/commit/8acad36))
- **plugin:** Improve `extractInnerCode` to handle missing braces and convert escaped newlines ([a7bd231](https://github.com/indaco/vitepress-templ-preview/commit/a7bd231))
- **plugin:** Access to the markdown-it instance in configResolved ([e64e62e](https://github.com/indaco/vitepress-templ-preview/commit/e64e62e))
- **plugin:** Correct typesVersions paths in package.json ([2a680dd](https://github.com/indaco/vitepress-templ-preview/commit/2a680dd))

### 💅 Refactors

- **plugin:** Css layer extractor ([d496683](https://github.com/indaco/vitepress-templ-preview/commit/d496683))
- **plugin:** Css parser and tokenizer ([6fd2ff2](https://github.com/indaco/vitepress-templ-preview/commit/6fd2ff2))
- **website:** Use explicit node prefix for fs and path modules ([abb51a1](https://github.com/indaco/vitepress-templ-preview/commit/abb51a1))
- **plugin:** Css tokenizer, token processor and HtmlStylesOptimizer to extract css from @layers ([a454e7d](https://github.com/indaco/vitepress-templ-preview/commit/a454e7d))
- **plugin:** Cache markdown-it instance in configResolved with createMarkdownRendered ([d042908](https://github.com/indaco/vitepress-templ-preview/commit/d042908))
- **plugin:** Modularize and streamline core logic ([589002d](https://github.com/indaco/vitepress-templ-preview/commit/589002d))

### 📖 Documentation

- **README.md:** Improve contributing section with clearer known issues and workaround ([653eebe](https://github.com/indaco/vitepress-templ-preview/commit/653eebe))
- **README.md:** Clean up the Contributing section ([f9552f0](https://github.com/indaco/vitepress-templ-preview/commit/f9552f0))
- **getting-started:** Add steps for vitepress search plugin ([637aa7b](https://github.com/indaco/vitepress-templ-preview/commit/637aa7b))
- **overview.md:** Fix typos ([e8a7c26](https://github.com/indaco/vitepress-templ-preview/commit/e8a7c26))

### 📦 Build

- **deps-dev:** Bump eslint-plugin-vue from 9.29.1 to 9.30.0 ([a8bea4f](https://github.com/indaco/vitepress-templ-preview/commit/a8bea4f))
- **deps-dev:** Bump @shikijs/transformers from 1.22.1 to 1.22.2 ([04f8b84](https://github.com/indaco/vitepress-templ-preview/commit/04f8b84))
- **deps-dev:** Bump shiki from 1.22.0 to 1.22.2 ([db242a0](https://github.com/indaco/vitepress-templ-preview/commit/db242a0))
- **deps-dev:** Bump vue-tsc from 2.1.8 to 2.1.10 ([bfea55f](https://github.com/indaco/vitepress-templ-preview/commit/bfea55f))
- **deps-dev:** Bump @types/node from 22.7.4 to 22.8.6 ([074c945](https://github.com/indaco/vitepress-templ-preview/commit/074c945))
- **package:** Bump vitest to v2.1.8 ([94bd268](https://github.com/indaco/vitepress-templ-preview/commit/94bd268))
- Update dev deps ([d285f8b](https://github.com/indaco/vitepress-templ-preview/commit/d285f8b))
- Bump pnpm to v9.15.0 ([a9c7007](https://github.com/indaco/vitepress-templ-preview/commit/a9c7007))
- Update dev deps ([8ff9841](https://github.com/indaco/vitepress-templ-preview/commit/8ff9841))
- **package:** Bump vite and vitejs/plugin-vue to the latest versions ([74420be](https://github.com/indaco/vitepress-templ-preview/commit/74420be))
- Update npm-deps ([15a71b0](https://github.com/indaco/vitepress-templ-preview/commit/15a71b0))
- Bump templ to v0.3.819 ([769d325](https://github.com/indaco/vitepress-templ-preview/commit/769d325))
- Update npm-deps (ansis & typescript) ([98d8829](https://github.com/indaco/vitepress-templ-preview/commit/98d8829))
- Bump vitepress to v1.5.0 ([50f8aed](https://github.com/indaco/vitepress-templ-preview/commit/50f8aed))
- **deps-dev:** Update to latest versions (ansis, eslint, publint) ([5990a6a](https://github.com/indaco/vitepress-templ-preview/commit/5990a6a))

### 🏡 Chore

- **example:** Update deps dev ([033ee98](https://github.com/indaco/vitepress-templ-preview/commit/033ee98))
- Move test files to the test folder ([005843e](https://github.com/indaco/vitepress-templ-preview/commit/005843e))
- **plugin:** Cleanup code-extractor.ts ([1795222](https://github.com/indaco/vitepress-templ-preview/commit/1795222))
- **plugin:** Improve user messages ([0f5fadf](https://github.com/indaco/vitepress-templ-preview/commit/0f5fadf))
- **plugin:** Update .gitignore ([21dd0f2](https://github.com/indaco/vitepress-templ-preview/commit/21dd0f2))
- **website:** Run templ fmt and generate with templ v0.3.819 ([5dbb4fd](https://github.com/indaco/vitepress-templ-preview/commit/5dbb4fd))
- **plugin:** Cleanup style-optimizer.test.ts ([59f87eb](https://github.com/indaco/vitepress-templ-preview/commit/59f87eb))
- **plugin:** Add error msg for vitepress missing markdown-it instance ([b2ae87f](https://github.com/indaco/vitepress-templ-preview/commit/b2ae87f))
- **plugin:** Rename test folder ([c1065eb](https://github.com/indaco/vitepress-templ-preview/commit/c1065eb))
- Reorganize files and folders ([3252ac3](https://github.com/indaco/vitepress-templ-preview/commit/3252ac3))
- **plugin:** Rename _rule-analyzer.ts_ to _css-rules-analyzer.ts_ ([1350984](https://github.com/indaco/vitepress-templ-preview/commit/1350984))
- Move `sanitizer.ts` from plugin folder to src ([4cb79e9](https://github.com/indaco/vitepress-templ-preview/commit/4cb79e9))
- Clean vite config file ([c0a51e7](https://github.com/indaco/vitepress-templ-preview/commit/c0a51e7))
- **plugin:** Move `VTPMessage` type to `plugin/types.ts` file ([5d7920a](https://github.com/indaco/vitepress-templ-preview/commit/5d7920a))
- Update husky pre-commit and pre-push hooks ([3357746](https://github.com/indaco/vitepress-templ-preview/commit/3357746))
- **plugin:** Split helpers in separate files. More tests added ([eed397d](https://github.com/indaco/vitepress-templ-preview/commit/eed397d))

### ✅ Tests

- **css-layer-extractor.ts:** Add more test cases ([1154282](https://github.com/indaco/vitepress-templ-preview/commit/1154282))
- **package:** Setup vitest coverage ([91274eb](https://github.com/indaco/vitepress-templ-preview/commit/91274eb))
- **plugin:** Add test suite for FileCache in file-utils.ts ([22fb052](https://github.com/indaco/vitepress-templ-preview/commit/22fb052))

### ❤️ Contributors

- Indaco ([@indaco](http://github.com/indaco))

## v0.2.0 - 2024-10-27

[compare changes](https://github.com/indaco/vitepress-templ-preview/compare/v0.1.8...v0.2.0)

### 🚀 Enhancements

- **plugin:** Add cacheSize to PluginOption to set the max number of files to cache ([d949348](https://github.com/indaco/vitepress-templ-preview/commit/d949348))
- **plugin:** Add VTPToggleButton as new renderering component ([cd0fd9c](https://github.com/indaco/vitepress-templ-preview/commit/cd0fd9c))

### 🩹 Fixes

- **plugin/utils.ts:** Make checkBinaries cross-platform ([0af68e5](https://github.com/indaco/vitepress-templ-preview/commit/0af68e5))
- **normalizeQuotes:** Replace outer double quotes with single quotes while preserving inner quotes ([016722f](https://github.com/indaco/vitepress-templ-preview/commit/016722f))
- **plugin/styles-optimizer.ts:** Prevent insertion of empty style tags when no styles are present ([7190ec2](https://github.com/indaco/vitepress-templ-preview/commit/7190ec2))
- **plugin/scripts-optimizer.ts:** Prevent insertion of empty script tags when no styles are present ([dcb9b1e](https://github.com/indaco/vitepress-templ-preview/commit/dcb9b1e))
- **plugin/scripts-optimizer.ts:** Fix: move all script tags to the first file to ensure JS is ready ([51e102b](https://github.com/indaco/vitepress-templ-preview/commit/51e102b))

### 💅 Refactors

- **plugin:** Script execution logic into class TemplScriptManager ([418d319](https://github.com/indaco/vitepress-templ-preview/commit/418d319))
- **plugin:** Rename shared.ts to highlighter.ts and exports ([70d0c7d](https://github.com/indaco/vitepress-templ-preview/commit/70d0c7d))
- Cache management ([2d91e28](https://github.com/indaco/vitepress-templ-preview/commit/2d91e28))
- **plugin/components:** Extract reusable components for component preview and code highlighting ([cfe5cbf](https://github.com/indaco/vitepress-templ-preview/commit/cfe5cbf))

### 📖 Documentation

- **website:** Update rendering components ([7268d12](https://github.com/indaco/vitepress-templ-preview/commit/7268d12))
- **website:** Update screenshots for rendering components ([f434587](https://github.com/indaco/vitepress-templ-preview/commit/f434587))
- **website:** Update motivation.md and overview.md files ([17ebc8a](https://github.com/indaco/vitepress-templ-preview/commit/17ebc8a))

### 📦 Build

- **deps-dev:** Bump @types/node from 20.14.12 to 22.7.4 ([09a9290](https://github.com/indaco/vitepress-templ-preview/commit/09a9290))
- **website:** Bump templ to v0.2.778 ([0a6e96d](https://github.com/indaco/vitepress-templ-preview/commit/0a6e96d))
- **example:** Bump templ to v0.2.778 ([e0e6c67](https://github.com/indaco/vitepress-templ-preview/commit/e0e6c67))
- **deps-dev:** Bump to latest versions ([8ecbf58](https://github.com/indaco/vitepress-templ-preview/commit/8ecbf58))

### 🏡 Chore

- **types:** Cleanup ([2eb7ec5](https://github.com/indaco/vitepress-templ-preview/commit/2eb7ec5))
- **plugin:** Fix typo in UserMessages for JS_OPTIMIZER ([1402327](https://github.com/indaco/vitepress-templ-preview/commit/1402327))
- Eslint - disable vue/max-attributes-per-line rule ([f1d25da](https://github.com/indaco/vitepress-templ-preview/commit/f1d25da))
- **plugin/components:** Move icon components into icons folder ([87df39e](https://github.com/indaco/vitepress-templ-preview/commit/87df39e))
- **demos:** Regenerate templ go files with templ v0.2.778 ([b94c2dd](https://github.com/indaco/vitepress-templ-preview/commit/b94c2dd))
- **plugin/components:** Rename VTPToggleButton to VTPToggle ([571396c](https://github.com/indaco/vitepress-templ-preview/commit/571396c))
- **website:** Regenerate templ.go files ([9a981f5](https://github.com/indaco/vitepress-templ-preview/commit/9a981f5))
- **plugin/styles-optimizer.ts:** Fix typo in temp dir name ([96219f7](https://github.com/indaco/vitepress-templ-preview/commit/96219f7))
- **plugin:** Bump version to 0.2.0-rc.1 ([00d7593](https://github.com/indaco/vitepress-templ-preview/commit/00d7593))

### 🎨 Styles

- **plugin/components:** Tune margin for ComponentCoder ([573b555](https://github.com/indaco/vitepress-templ-preview/commit/573b555))
- **plugin/components:** Lighter bg color for ComponentCoder ([cc2f019](https://github.com/indaco/vitepress-templ-preview/commit/cc2f019))
- **components:** Align items for ComponentPreviewer.vue ([afce5e8](https://github.com/indaco/vitepress-templ-preview/commit/afce5e8))

### ❤️ Contributors

- Indaco <github@mircoveltri.me>

## v0.1.8 - 2024-10-07

[compare changes](https://github.com/indaco/vitepress-templ-preview/compare/v0.1.7...v0.1.8)

### 🩹 Fixes

- Make size prop optional in Icon components to fix TS error ([2d9d702](https://github.com/indaco/vitepress-templ-preview/commit/2d9d702))
- Html code replacement of outer double quotes with single quotes due to JSON.stringify ([dc5021e](https://github.com/indaco/vitepress-templ-preview/commit/dc5021e))

### 💅 Refactors

- **plugin:** Split Vite plugin and Markdown-it plugin into separate modules ([b27370f](https://github.com/indaco/vitepress-templ-preview/commit/b27370f))

### 📖 Documentation

- **website:** Upper case title ([272c129](https://github.com/indaco/vitepress-templ-preview/commit/272c129))

### 📦 Build

- **deps-dev:** Bump husky from 9.1.4 to 9.1.5 ([b57a384](https://github.com/indaco/vitepress-templ-preview/commit/b57a384))
- **deps-dev:** Bump @commitlint/cli from 19.4.0 to 19.4.1 ([d5221b7](https://github.com/indaco/vitepress-templ-preview/commit/d5221b7))
- **deps-dev:** Bump vue from 3.4.35 to 3.4.38 ([2367ab4](https://github.com/indaco/vitepress-templ-preview/commit/2367ab4))
- **deps-dev:** Bump publint from 0.2.9 to 0.2.10 ([c20370c](https://github.com/indaco/vitepress-templ-preview/commit/c20370c))
- Update dev deps ([83e2080](https://github.com/indaco/vitepress-templ-preview/commit/83e2080))
- Properly set eslint config ([5a154ff](https://github.com/indaco/vitepress-templ-preview/commit/5a154ff))
- **deps-dev:** Bump to latest versions ([ce9cd1a](https://github.com/indaco/vitepress-templ-preview/commit/ce9cd1a))
- **deps-dev:** Example project - bump to latest versions ([ff2c05a](https://github.com/indaco/vitepress-templ-preview/commit/ff2c05a))

### 🏡 Chore

- **package:** Fix lint suggestion on pkg.repository.url ([e7f2269](https://github.com/indaco/vitepress-templ-preview/commit/e7f2269))
- Bump pnpm from v9.7.0 to v9.9.0 ([166c5e3](https://github.com/indaco/vitepress-templ-preview/commit/166c5e3))
- Update pnpm-lock.yaml ([6e28b22](https://github.com/indaco/vitepress-templ-preview/commit/6e28b22))
- **dev-deps:** Update ([5d670a2](https://github.com/indaco/vitepress-templ-preview/commit/5d670a2))
- **website:** Remove redundant import for VPBadge component ([77777f1](https://github.com/indaco/vitepress-templ-preview/commit/77777f1))
- Lint vue components ([5a4b7b2](https://github.com/indaco/vitepress-templ-preview/commit/5a4b7b2))
- **dev-deps:** Update ([f1ccb68](https://github.com/indaco/vitepress-templ-preview/commit/f1ccb68))
- Bump pnpm from 9.9.0 to 9.11.0 ([87b938e](https://github.com/indaco/vitepress-templ-preview/commit/87b938e))
- Update pnpm-lock.yaml ([9f22e59](https://github.com/indaco/vitepress-templ-preview/commit/9f22e59))

### 🎨 Styles

- **website:** Add vitepress-plugin-group-icons ([c3c656f](https://github.com/indaco/vitepress-templ-preview/commit/c3c656f))
- **components:** Use gap ([228f9c7](https://github.com/indaco/vitepress-templ-preview/commit/228f9c7))
- Tune gap in preview-content class ([1d0bad1](https://github.com/indaco/vitepress-templ-preview/commit/1d0bad1))

### ❤️ Contributors

- Indaco <github@mircoveltri.me>

## v0.1.7 - 2024-08-08

[compare changes](https://github.com/indaco/vitepress-templ-preview/compare/v0.1.6...v0.1.7)

### 🩹 Fixes

- **components:** Ensure proper script execution even when DOMContentLoaded event listener ([4719ee8](https://github.com/indaco/vitepress-templ-preview/commit/4719ee8))

### 🏡 Chore

- Update dev deps ([6ea93e9](https://github.com/indaco/vitepress-templ-preview/commit/6ea93e9))
- Bump pnpm from v9.5.0 to v9.7.0 ([33ea305](https://github.com/indaco/vitepress-templ-preview/commit/33ea305))
- Update massages for script and style tags optimizer ([58da45f](https://github.com/indaco/vitepress-templ-preview/commit/58da45f))
- Bump vite and vue to latest versions ([b7dea56](https://github.com/indaco/vitepress-templ-preview/commit/b7dea56))

### ❤️ Contributors

- Indaco <github@mircoveltri.me>

## v0.1.6 - 2024-08-02

[compare changes](https://github.com/indaco/vitepress-templ-preview/compare/v0.1.5...v0.1.6)

### 🩹 Fixes

- **plugin/HtmlStylesOptimizer:** Consolidate style tags across HTML files within the same folder ([b1e7930](https://github.com/indaco/vitepress-templ-preview/commit/b1e7930))
- **plugin/HtmlScriptsOptimizer:** Consolidate script tags across HTML files within the same folder ([c41d4a8](https://github.com/indaco/vitepress-templ-preview/commit/c41d4a8))

### 📦 Build

- **deps-dev:** Bump vue from 3.4.34 to 3.4.35 ([7e5b393](https://github.com/indaco/vitepress-templ-preview/commit/7e5b393))

### 🏡 Chore

- Update dev deps ([47ece9b](https://github.com/indaco/vitepress-templ-preview/commit/47ece9b))

### ❤️ Contributors

- Indaco <github@mircoveltri.me>

## v0.1.5 - 2024-08-01

[compare changes](https://github.com/indaco/vitepress-templ-preview/compare/v0.1.4...v0.1.5)

### 🔥 Performance

- **components:** Improve components by using v-show instead of v-if for tab content visibility ([279210b](https://github.com/indaco/vitepress-templ-preview/commit/279210b))

### 🩹 Fixes

- **plugin:** Consolidate style tags across html files within the same folder ([0b5cf2b](https://github.com/indaco/vitepress-templ-preview/commit/0b5cf2b))
- **plugin:** Consolidate script tags across html files within the same folder ([215e117](https://github.com/indaco/vitepress-templ-preview/commit/215e117))
- **components:** Generating unique IDs for component instances and aria controls added ([55377fe](https://github.com/indaco/vitepress-templ-preview/commit/55377fe))

### 📦 Build

- **plugin:** Run test ([58cdaee](https://github.com/indaco/vitepress-templ-preview/commit/58cdaee))

### 🏡 Chore

- **plugin:** Update dev deps ([8e85030](https://github.com/indaco/vitepress-templ-preview/commit/8e85030))
- **website:** Update dev deps ([17b1a51](https://github.com/indaco/vitepress-templ-preview/commit/17b1a51))
- Bump husky from v9.1.3 to v9.1.4 ([c0cc5ec](https://github.com/indaco/vitepress-templ-preview/commit/c0cc5ec))
- **plugin:** Log info about styles and scripts optimization ([353ffe6](https://github.com/indaco/vitepress-templ-preview/commit/353ffe6))

### 🎨 Styles

- **components:** Tuning button sizes on VTPIconTabs ([721e830](https://github.com/indaco/vitepress-templ-preview/commit/721e830))

### ❤️ Contributors

- Indaco <github@mircoveltri.me>

## v0.1.4 - 2024-07-30

[compare changes](https://github.com/indaco/vitepress-templ-preview/compare/v0.1.3...v0.1.4)

### 🏡 Chore

- **components:** Remove component props from export ([0748943](https://github.com/indaco/vitepress-templ-preview/commit/0748943))

### 🎨 Styles

- **components:** Better spacing and flex-flow ([c3d589a](https://github.com/indaco/vitepress-templ-preview/commit/c3d589a))

### ❤️ Contributors

- Indaco <github@mircoveltri.me>

## v0.1.3 - 2024-07-29

[compare changes](https://github.com/indaco/vitepress-templ-preview/compare/v0.1.2...v0.1.3)

### 🩹 Fixes

- **plugin:** Tag name ([c893a98](https://github.com/indaco/vitepress-templ-preview/commit/c893a98))

### 💅 Refactors

- **website:** Npm package version as VersionBadge component ([cc0d1e1](https://github.com/indaco/vitepress-templ-preview/commit/cc0d1e1))

### 📖 Documentation

- **website:** Swap tags and text in getting-started ([a51b3c7](https://github.com/indaco/vitepress-templ-preview/commit/a51b3c7))
- **types.ts:** Add comments ([89f0779](https://github.com/indaco/vitepress-templ-preview/commit/89f0779))

### 📦 Build

- **plugin:** Minify code ([5a65f17](https://github.com/indaco/vitepress-templ-preview/commit/5a65f17))
- **components:** Out dir ([a6bf473](https://github.com/indaco/vitepress-templ-preview/commit/a6bf473))

### 🏡 Chore

- Update dev deps ([ea91dc3](https://github.com/indaco/vitepress-templ-preview/commit/ea91dc3))
- **components:** Better typescript support ([d559b93](https://github.com/indaco/vitepress-templ-preview/commit/d559b93))

### 🎨 Styles

- **components:** Centering content ([12d1c16](https://github.com/indaco/vitepress-templ-preview/commit/12d1c16))
- **website:** Alert component set width to 100% ([6077650](https://github.com/indaco/vitepress-templ-preview/commit/6077650))

### ❤️ Contributors

- Indaco <github@mircoveltri.me>

## v0.1.2 - 2024-07-18

[compare changes](https://github.com/indaco/vitepress-templ-preview/compare/v0.1.1...v0.1.2)

### 🩹 Fixes

- **plugin:** Extract single and multilines imports ([54f8f5c](https://github.com/indaco/vitepress-templ-preview/commit/54f8f5c))

### 📖 Documentation

- **README.md:** Fix typo in npm badge ([0facfd9](https://github.com/indaco/vitepress-templ-preview/commit/0facfd9))
- **website:** Fix default values for code extractor ([4f7c052](https://github.com/indaco/vitepress-templ-preview/commit/4f7c052))

### 📦 Build

- **package:** Remove @swc/core with tsup v8.1.2 ([2d1acf2](https://github.com/indaco/vitepress-templ-preview/commit/2d1acf2))
- **husky:** Remove deprecations with v9.1.0 ([67eb5d7](https://github.com/indaco/vitepress-templ-preview/commit/67eb5d7))

### 🏡 Chore

- Bump `husky` from v9.0.11 to v9.1.0 ([49f4447](https://github.com/indaco/vitepress-templ-preview/commit/49f4447))
- Bump `ansis` from v3.2.0 to v3.3.0 ([184dca2](https://github.com/indaco/vitepress-templ-preview/commit/184dca2))
- Setup `changie` ([e76fffd](https://github.com/indaco/vitepress-templ-preview/commit/e76fffd))

### 🤖 CI

- Add `dependabot.yml` for npm version updates ([cd03baf](https://github.com/indaco/vitepress-templ-preview/commit/cd03baf))

### ❤️ Contributors

- Indaco <github@mircoveltri.me>

## v0.1.1 - 2024-07-17

[compare changes](https://github.com/indaco/vitepress-templ-preview/compare/v0.1.0...v0.1.1)

### 🏡 Chore

- add README.md file to the package

### ❤️ Contributors

- Indaco <github@mircoveltri.me>

## v0.1.0 - 2024-07-17

### 🏡 Chore

- initial release

### ❤️ Contributors

- Indaco <github@mircoveltri.me>
