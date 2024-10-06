import type {
  PluginContext,
  TagAttrs,
  VTPComponentProps,
  ButtonStyle,
  CodeExtractorOptions,
} from '../types';
import * as fs from 'node:fs';
import MarkdownIt from 'markdown-it';
import {
  parseAttrs,
  getAttributeOrElse,
  generateTemplPreviewComponentHtml,
  handleOpMode,
} from './helpers';
import type { StateCore, Token } from 'markdown-it/index.js';
import { UserMessages } from '../user-messages';
import {
  escapeForJSON,
  getCachedFileContent,
  watchFileChanges,
} from '../utils';
import { Logger } from '../logger';

const TEMPL_DEMO_REGEX = /<templ-demo\s+([^>]+?)\/?>/;

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

  // Options for code extractor
  const extractorOpts: CodeExtractorOptions = {
    goExportedOnly: Boolean(
      getAttributeOrElse(token, 'data-exported-only', 'false', true),
    ),
    goPackage: Boolean(
      getAttributeOrElse(token, 'data-go-package', 'true', true),
    ),
    goImports: Boolean(
      getAttributeOrElse(token, 'data-go-imports', 'true', true),
    ),
    goConsts: Boolean(
      getAttributeOrElse(token, 'data-go-consts', 'false', true),
    ),
    goVars: Boolean(getAttributeOrElse(token, 'data-go-vars', 'false', true)),
    goTypes: Boolean(getAttributeOrElse(token, 'data-go-types', 'false', true)),
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

export default function markdownItTemplPreviewPlugin(
  md: MarkdownIt,
  context: PluginContext,
  id: string,
) {
  md.core.ruler.push('templ_demo', processTokens);
  md.renderer.rules.templ_demo = (tokens, idx) =>
    renderTemplPreview(context.serverCommand, tokens, idx, context, id);
}
