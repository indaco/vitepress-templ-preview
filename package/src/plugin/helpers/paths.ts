import type { PluginConfig } from '../../types';
import path from 'node:path';
import { UserMessages } from '../messages';
import { Logger } from '../logger';

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

  // Validate mode
  const { mode, inputDir, outputDir, goProjectDir } = options;
  if (!mode) {
    Logger.error(UserMessages.MODE_NOT_DEFINED);
    throw new Error(
      `[vitepress-templ-preview] ${UserMessages.MODE_NOT_DEFINED.headline}: ${UserMessages.MODE_NOT_DEFINED.message}.`,
    );
  }

  // Path resolver helper
  const resolvePath = (
    baseDir: string,
    subDir: string | undefined,
    filename: string,
  ) => path.resolve(baseDir, subDir ?? '', filename);

  // Generate paths based on the mode
  const generatePaths = (
    baseDir: string,
    input: string | undefined,
    output: string | undefined,
    filename: string,
  ): { templFile: string; htmlFile: string } => {
    const templFile = resolvePath(
      baseDir,
      input,
      `${filename}${TEMPL_EXTENSION}`,
    );
    const htmlFile = resolvePath(
      baseDir,
      output,
      `${filename}${HTML_EXTENSION}`,
    );
    return { templFile, htmlFile };
  };

  // Define paths for each mode
  switch (mode) {
    case 'inline': {
      const baseDir = path.dirname(id);
      const input = '';
      const output = path.dirname(srcValue);
      return generatePaths(baseDir, input, output, srcValue);
    }
    case 'bundle': {
      const input = inputDir || goProjectDir!;
      const output = outputDir || inputDir || goProjectDir!;
      return generatePaths(serverRoot, input, output, srcValue);
    }
    default:
      Logger.error(UserMessages.UNKNOWN_MODE_ERROR, mode);
      throw new Error(
        `[vitepress-templ-preview] ${UserMessages.UNKNOWN_MODE_ERROR.headline}: ${UserMessages.UNKNOWN_MODE_ERROR.message}.`,
      );
  }
}
