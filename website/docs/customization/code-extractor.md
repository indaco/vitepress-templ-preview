# Code Block Extractor

Your `templ` code can include various necessary code elements like package declarations, import statements, constants, variables, and type definitions, which you might not want to display in the extracted code blocks. Here is how to configure the code extractor to include or exclude these elements based on your requirements.

You can configure the level of detail included in the extracted code blocks by setting the corresponding `data` attribute on the [component](/guide/usage#component-configuration) tag.

> [!IMPORTANT]
> The `data` attribute is in the form of `data-` followed by the option name in kebab case. For example, to include the package statement, use `data-include-package="true"`.

## Options

| Option           | Type      | Default | Description                                                   |
| :--------------- | :-------- | :------ | ------------------------------------------------------------- |
| `includePackage` | _boolean_ | `false` | Include the `package` statement in the extracted code blocks. |
| `includeImports` | _boolean_ | `false` | Include `import` statements in the extracted code blocks.     |
| `includeConsts`  | _boolean_ | `false` | Include `const` declarations in the extracted code blocks.    |
| `includeVars`    | _boolean_ | `false` | Include `var` declarations in the extracted code blocks.      |
| `includeTypes`   | _boolean_ | `false` | Include `type` definitions in the extracted code blocks.      |
