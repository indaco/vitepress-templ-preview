import type {
  PluginConfig,
  PluginContext,
  CachedFile,
  TagAttrs,
  VTPComponentProps,
  ButtonStyle,
  VTPUserConfig,
  CodeExtractorOptions,
  UserMessage,
} from '../types';
import * as fs from 'node:fs';
import path from 'node:path';
import { Plugin } from 'vite';
import { MarkdownOptions } from 'vitepress';
import MarkdownIt from 'markdown-it';
import type { StateCore, Token } from 'markdown-it/index.js';
import { UserMessages } from '../user-messages';
import {
  checkBinaries,
  escapeForJSON,
  executeCommandSync,
  getCachedFileContent,
  unescapeFromJSON,
  updateCache,
  watchFileChanges,
} from '../utils';
import { BundledTheme } from 'shiki';
import { Logger } from '../logger';
import HtmlStylesOptimizer from '../styles-optimizer';
import HtmlScriptsOptimizer from '../scripts-optimizer';
import { CodeExtractor } from '../code-extractor';

const TEMPL_DEMO_REGEX = /<templ-demo\s+([^>]+?)\/?>/;
const TEMPL_BIN = 'templ';
const STATIC_TEMPL_BIN = 'static-templ';

// Function to parse attributes from the matched tag
const parseAttrs = (attrsString: string): TagAttrs => {
  const attrs: TagAttrs = {};
  const regex = /([a-zA-Z0-9-]+)="([^"]+)"/g;
  const matches = attrsString.matchAll(regex);

  for (const match of matches) {
    const [key, value] = [match[1], match[2]];
    attrs[key] = value;
  }

  return attrs;
};

/**
 * Retrieves the value of a specific attribute from the token.
 *
 * @param {Token} token - The markdown-it token.
 * @param {string} attrName - The name of the attribute.
 * @param {string} defaultValue - The default value if the attribute is not found.
 * @param {boolean} [parseJson=false] - Whether to parse the attribute value as JSON.
 * @returns {string | boolean} - The attribute value or the default value.
 */
function getAttributeOrElse(
  token: Token,
  attrName: string,
  defaultValue: string,
  parseJson: boolean = false,
): string | boolean {
  const attr = token.attrs?.find((attr) => attr[0] === attrName);
  if (attr) {
    return parseJson ? JSON.parse(attr[1].toLowerCase()) : attr[1];
  }
  return parseJson ? JSON.parse(defaultValue.toLowerCase()) : defaultValue;
}

/**
 * Creates a new token with the parsed attributes.
 * @param state - The state object from markdown-it.
 * @param attrs - The attributes to add to the token.
 * @returns The created token.
 */
function createTemplDemoToken(state: StateCore, attrs: TagAttrs) {
  const token = new state.Token('templ_demo', 'templ-demo', 0);
  token.attrs = Object.keys(attrs).map((key) => [key, attrs[key]]);
  return token;
}

/**
 * Processes the tokens and replaces the matched custom tag.
 * @param state - The state object from markdown-it.
 */
function processTokens(state: StateCore) {
  const tokens = state.tokens;
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'html_inline') {
      const match = tokens[i].content.match(TEMPL_DEMO_REGEX);
      if (match) {
        const attrsString = match[1];
        const attrs = parseAttrs(attrsString);
        tokens[i] = createTemplDemoToken(state, attrs);
      }
    }
  }
}

/**
 * Builds the command string for generating HTML files from Templ files.
 *
 * @param serverRoot - The root directory of the server.
 * @param resolvedOptions - The plugin options.
 * @returns The command string.
 */
function buildTemplGenerateCommandStr(
  serverRoot: string,
  resolvedOptions: PluginConfig,
): string {
  return `cd ${serverRoot}/${resolvedOptions.goProjectDir} && ${TEMPL_BIN} generate .`;
}

/**
 * Builds the command string for generating HTML files from Templ files.
 * @param serverRoot - The root directory of the server.
 * @param resolvedOptions - The plugin options.
 * @returns The command string.
 */
function buildStaticTemplCommandStr(
  serverRoot: string,
  resolvedOptions: PluginConfig,
): string {
  const baseCmd = `cd ${serverRoot}/${resolvedOptions.goProjectDir} && ${STATIC_TEMPL_BIN} -m ${resolvedOptions.mode} -i ${resolvedOptions.inputDir} -g=${resolvedOptions.runTemplGenerate} -d=${resolvedOptions.debug}`;

  if (resolvedOptions.mode === 'bundle') {
    return `${baseCmd} -o ${resolvedOptions.outputDir}`;
  }

  return baseCmd;
}

/**
 * Generates the HTML for the templ preview component.
 * @param md - The MarkdownIt instance.
 * @param componentProps - The properties for the preview component.
 * @param extractorOptions - The options for the code extractor.
 * @returns The HTML string for the templ preview component.
 */
function generateTemplPreviewComponentHtml(
  md: MarkdownIt,
  componentProps: VTPComponentProps,
  extractorOptions?: CodeExtractorOptions,
): string {
  // Decode the escape sequences in the codeContent
  const decodedCodeContent = unescapeFromJSON(componentProps.codeContent);

  const extractor = new CodeExtractor(decodedCodeContent, extractorOptions);
  const templBlocks = extractor.extract();

  const _props = {
    codeContent: unescapeFromJSON(templBlocks[0]),
    htmlContent: unescapeFromJSON(componentProps.htmlContent),
    buttonStyle: md.utils.escapeHtml(componentProps.buttonStyle),
    themes: componentProps.themes,
    isPreviewFirst: componentProps.isPreviewFirst,
    isPreviewOnly: componentProps.isPreviewOnly,
  };

  return `<VTPLivePreview v-bind='${JSON.stringify(_props)}'></VTPLivePreview>`;
}

/**
 * Handles the operation mode for generating template and HTML file paths.
 *
 * @param {string} id - The identifier of the source file.
 * @param {string} serverRoot - The root directory of the server.
 * @param {Partial<PluginConfig>} options - Configuration options for the plugin.
 * @param {string} srcValue - The source value to be used in the file names.
 * @returns {{ templFile: string; htmlFile: string }} - Object containing the paths for the template and HTML files.
 * @throws {Error} - Throws an error if the mode is unknown or not defined in options.
 */
function handleOpMode(
  id: string,
  serverRoot: string,
  options: Partial<PluginConfig>,
  srcValue: string,
): { templFile: string; htmlFile: string } {
  const TEMPL_EXTENSION = '.templ';
  const HTML_EXTENSION = '.html';

  if (!options.mode) {
    Logger.error(UserMessages.MODE_NOT_DEFINED);
    throw new Error(
      `[vitepress-templ-preview] ${UserMessages.MODE_NOT_DEFINED.headline}: ${UserMessages.MODE_NOT_DEFINED.message}.`,
    );
  }

  const resolvePath = (
    baseDir: string,
    dir: string | undefined,
    filename: string,
  ) => path.resolve(baseDir, dir ?? '', filename);

  const mode = options.mode;
  let templFilePath = '';
  let htmlFilePath = '';

  switch (mode) {
    case 'inline':
      templFilePath = resolvePath(
        path.dirname(id),
        '',
        `${srcValue}${TEMPL_EXTENSION}`,
      );
      htmlFilePath = resolvePath(
        path.dirname(id),
        '',
        `${srcValue}${HTML_EXTENSION}`,
      );
      break;
    case 'bundle':
      const inputDir = options.inputDir || options.goProjectDir!;
      const outputDir =
        options.outputDir || options.inputDir || options.goProjectDir!;
      templFilePath = resolvePath(
        serverRoot,
        inputDir,
        `${srcValue}${TEMPL_EXTENSION}`,
      );
      htmlFilePath = resolvePath(
        serverRoot,
        outputDir,
        `${srcValue}${HTML_EXTENSION}`,
      );
      break;
    default:
      Logger.error(UserMessages.UNKNOWN_MODE_ERROR, mode);
      throw new Error(
        `[vitepress-templ-preview] ${UserMessages.UNKNOWN_MODE_ERROR.headline}: ${UserMessages.UNKNOWN_MODE_ERROR.message}.`,
      );
  }

  return {
    templFile: templFilePath,
    htmlFile: htmlFilePath,
  };
}

/**
 * Renders the templ preview component.
 *
 * @param {("build" | "serve")} serverCommand - The server command ("build" or "serve").
 * @param {Token[]} tokens - The markdown-it tokens.
 * @param {number} idx - The index of the current token.
 * @param {PluginContext} context - The plugin context.
 * @param {string} id - The id of the markdown file.
 * @returns {string} - The HTML string for the templ preview component.
 * @throws {Error} - Throws an error if the 'src' attribute is not defined or empty.
 */
function renderTemplPreview(
  serverCommand: 'build' | 'serve',
  tokens: Token[],
  idx: number,
  context: PluginContext,
  id: string,
): string {
  const token = tokens[idx];
  const { md, serverRoot, pluginOptions, fileCache, watchedMdFiles, theme } =
    context;

  // Mandatory attribute on the tag.
  const srcAttr = token.attrs?.find((attr) => attr[0] === 'src');
  if (!srcAttr || !srcAttr[1]) {
    Logger.error(UserMessages.NO_SRC_ATTR_ERROR);
    throw new Error(
      `[vitepress-templ-preview] ${UserMessages.NO_SRC_ATTR_ERROR.headline}: ${UserMessages.NO_SRC_ATTR_ERROR.message}`,
    );
  }

  // Retrieve attribute values
  const srcValue = srcAttr[1];
  const buttonStyleValue = getAttributeOrElse(
    token,
    'data-button-variant',
    'alt',
  ) as ButtonStyle;
  const isPreviewFirstValue = getAttributeOrElse(
    token,
    'data-preview-first',
    'true',
    true,
  );
  const isPreviewOnlyValue = getAttributeOrElse(
    token,
    'data-preview-only',
    'false',
    true,
  );
  /**
   * code extractors options attributes
   */
  const isGoExportedOnlyValue = getAttributeOrElse(
    token,
    'data-exported-only',
    'false',
    true,
  );
  const isGoPackageValue = getAttributeOrElse(
    token,
    'data-go-package',
    'true',
    true,
  );
  const isGoImportsValue = getAttributeOrElse(
    token,
    'data-go-imports',
    'true',
    true,
  );
  const isGoConstsValue = getAttributeOrElse(
    token,
    'data-go-consts',
    'false',
    true,
  );
  const isGoVarsValue = getAttributeOrElse(
    token,
    'data-go-vars',
    'false',
    true,
  );
  const isGoTypesValue = getAttributeOrElse(
    token,
    'data-go-types',
    'false',
    true,
  );

  const extractorOpts: CodeExtractorOptions = {
    goExportedOnly: Boolean(isGoExportedOnlyValue),
    goPackage: Boolean(isGoPackageValue),
    goImports: Boolean(isGoImportsValue),
    goConsts: Boolean(isGoConstsValue),
    goVars: Boolean(isGoVarsValue),
    goTypes: Boolean(isGoTypesValue),
  };

  const resolvedPaths = handleOpMode(id, serverRoot, pluginOptions, srcValue);

  let htmlContent = 'Loading...'; // Default placeholder
  let codeContent = token.content;

  if (serverCommand === 'serve') {
    htmlContent = getCachedFileContent(
      fileCache,
      resolvedPaths.htmlFile,
      htmlContent,
    );
    codeContent = getCachedFileContent(
      fileCache,
      resolvedPaths.templFile,
      codeContent,
    );

    watchFileChanges(watchedMdFiles, resolvedPaths.htmlFile, id);
    watchFileChanges(watchedMdFiles, resolvedPaths.templFile, id);
  } else if (serverCommand === 'build') {
    htmlContent = fs.readFileSync(resolvedPaths.htmlFile, 'utf8');
    codeContent = fs.readFileSync(resolvedPaths.templFile, 'utf8');
  }

  const componentProps: VTPComponentProps = {
    codeContent: escapeForJSON(codeContent),
    htmlContent: escapeForJSON(htmlContent),
    buttonStyle: buttonStyleValue,
    themes: theme,
    isPreviewFirst: Boolean(isPreviewFirstValue),
    isPreviewOnly: Boolean(isPreviewOnlyValue),
  };

  return generateTemplPreviewComponentHtml(md, componentProps, extractorOpts);
}

// Default values for the PluginOptions
const defaultPluginOptions: PluginConfig = {
  goProjectDir: '',
  mode: 'inline',
  inputDir: 'components',
  outputDir: 'output',
  debug: false,
  runTemplGenerate: true,
};

const viteTemplPreviewPlugin = async (
  options?: VTPUserConfig,
): Promise<Plugin<any>> => {
  const resolvedPluginOptions: PluginConfig = {
    ...defaultPluginOptions,
    ...options,
  };
  const fileCache: Record<string, CachedFile> = {};
  const watchedMdFiles: Record<string, Set<string>> = {};
  const defaultThemes: { light: BundledTheme; dark: BundledTheme } = {
    light: 'github-light',
    dark: 'github-dark',
  };

  let mdInstance: MarkdownIt;
  let serverRoot: string;
  let serverCommand: 'build' | 'serve';
  let userThemes: any;
  let stylesOptimizer: HtmlStylesOptimizer;
  let scriptsOptimizer: HtmlScriptsOptimizer;

  return {
    name: 'vite:templ-preview',
    enforce: 'pre',
    configResolved(config) {
      serverRoot = config.root;
      serverCommand = config.command;

      const inputDirectory = path.join(
        serverRoot,
        resolvedPluginOptions.inputDir,
      );
      stylesOptimizer = HtmlStylesOptimizer.getInstance(inputDirectory);
      scriptsOptimizer = HtmlScriptsOptimizer.getInstance(inputDirectory);

      if ((config as any).vitepress) {
        const { markdown } = (config as any).vitepress;
        if (!markdown) {
          Logger.errorHighlighted(UserMessages.MISSING_MARKDOWN_OBJ_ERROR);
          Logger.warning(UserMessages.MISSING_MARKDOWN_OBJ_HINT);
          throw new Error(
            `[vitepress-templ-preview] ${UserMessages.MISSING_MARKDOWN_OBJ_ERROR.headline} ${UserMessages.MISSING_MARKDOWN_OBJ_ERROR.message}`,
          );
        }

        userThemes = (markdown as MarkdownOptions).theme;

        if (typeof markdown.config === 'function') {
          const originalConfig = markdown.config;
          markdown.config = (md: MarkdownIt) => {
            originalConfig(md);
            mdInstance = md;
          };
        } else {
          markdown.config = (md: MarkdownIt) => {
            mdInstance = md;
          };
        }
      }
    },
    async buildStart() {
      checkBinaries([STATIC_TEMPL_BIN]);

      if (!resolvedPluginOptions.runTemplGenerate) {
        checkBinaries([TEMPL_BIN]);
        const templCmd = buildTemplGenerateCommandStr(
          serverRoot,
          resolvedPluginOptions,
        );
        executeCommandSync(templCmd);
      }

      const staticTemplcmd = buildStaticTemplCommandStr(
        serverRoot,
        resolvedPluginOptions,
      );

      executeCommandSync(staticTemplcmd);

      // Consolidating html style and script tags across static-templ generated html files
      Logger.info(UserMessages.CSS_OPTIMIZER);
      stylesOptimizer.run();
      Logger.info(UserMessages.JS_OPTIMIZER);
      scriptsOptimizer.run();
    },
    async configureServer(server) {
      if (serverCommand === 'serve') {
        checkBinaries([STATIC_TEMPL_BIN]);

        if (!resolvedPluginOptions.runTemplGenerate) {
          checkBinaries([TEMPL_BIN]);
          const templCmd = buildTemplGenerateCommandStr(
            serverRoot,
            resolvedPluginOptions,
          );
          executeCommandSync(templCmd);
        }

        const staticTemplcmd = buildStaticTemplCommandStr(
          serverRoot,
          resolvedPluginOptions,
        );
        executeCommandSync(staticTemplcmd);

        // Consolidating html style and script tags across static-templ generated html files
        Logger.info(UserMessages.CSS_OPTIMIZER);
        stylesOptimizer.run();
        Logger.info(UserMessages.JS_OPTIMIZER);
        scriptsOptimizer.run();

        updateCache(
          serverRoot,
          resolvedPluginOptions,
          fileCache,
          watchedMdFiles,
          server,
        );
      }
    },
    handleHotUpdate(ctx) {
      if (serverCommand === 'serve') {
        const { file, server, modules } = ctx;

        if (file.endsWith('.templ')) {
          Logger.info(<UserMessage>{ headline: 'File changed', message: file });
          const cmd = buildStaticTemplCommandStr(
            serverRoot,
            resolvedPluginOptions,
          );
          executeCommandSync(cmd);

          // Consolidating html style and script tags across static-templ generated html files
          Logger.info(UserMessages.CSS_OPTIMIZER);
          stylesOptimizer.run();
          Logger.info(UserMessages.JS_OPTIMIZER);
          scriptsOptimizer.run();

          updateCache(
            serverRoot,
            resolvedPluginOptions,
            fileCache,
            watchedMdFiles,
            server,
            false,
          );

          setTimeout(() => {
            if (watchedMdFiles[file]) {
              watchedMdFiles[file].forEach((mdFile) => {
                const module = server.moduleGraph.getModuleById(mdFile);
                if (module) {
                  server.moduleGraph.invalidateModule(module);
                }
              });
            }

            server.ws.send({
              type: 'full-reload',
            });
          }, 500);
        }
        return modules;
      }
    },
    async transform(code, id) {
      if (!id.endsWith('.md')) return;

      // Check if the markdown contains the templ demo parameters
      if (!TEMPL_DEMO_REGEX.test(code)) return;

      const context: PluginContext = {
        md: mdInstance,
        serverRoot,
        pluginOptions: {
          ...resolvedPluginOptions,
          inputDir: path.join(
            resolvedPluginOptions.goProjectDir!,
            resolvedPluginOptions.inputDir!,
          ),
          outputDir: path.join(
            resolvedPluginOptions.goProjectDir!,
            resolvedPluginOptions.outputDir!,
          ),
        },
        fileCache,
        watchedMdFiles,
        theme: { ...defaultThemes, ...userThemes },
      };

      mdInstance.core.ruler.push('templ_demo', processTokens);
      mdInstance.renderer.rules.templ_demo = (tokens: Token[], idx: number) =>
        renderTemplPreview(serverCommand, tokens, idx, context, id);

      const rendered = mdInstance.render(code);
      if (!rendered.includes('VTPLivePreview')) return;
      return {
        code: rendered,
        map: null,
      };
    },
  };
};

export default viteTemplPreviewPlugin;
