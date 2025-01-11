import type {
  PluginConfig,
  VTPComponentProps,
  CodeExtractorOptions,
} from '../../types';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import type { Token } from 'markdown-it/index.js';
import { UserMessages } from '../messages';
import { unescapeFromJSON } from './strings';
import { Logger } from '../logger';
import { CodeExtractor } from '../code-extractor';
import { TagAttrs } from '../types';

// Function to parse attributes from the matched tag
export function parseAttrs(attrsString: string): TagAttrs {
  const attrs: TagAttrs = {};
  const regex = /([a-zA-Z0-9-]+)="([^"]+)"/g;
  const matches = attrsString.matchAll(regex);

  for (const match of matches) {
    const [key, value] = [match[1], match[2]];
    attrs[key] = value;
  }

  return attrs;
}

export /**
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
 * Generates the HTML for the templ preview component.
 * @param md - The MarkdownIt instance.
 * @param componentProps - The properties for the preview component.
 * @param extractorOptions - The options for the code extractor.
 * @returns The HTML string for the templ preview component.
 */
export function generateTemplPreviewComponentHtml(
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
export function handleOpMode(
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
        path.dirname(srcValue),
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
