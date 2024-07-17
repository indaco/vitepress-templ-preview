import { execSync, spawnSync } from 'node:child_process';
import type { CachedFile, PluginConfig, UserMessage } from './types';
import path from 'node:path';
import * as fsp from 'node:fs/promises';
import { Logger } from './logger';
import { UserMessages } from './user-messages';

/**
 * Updates the cache for a specific file by reading its content.
 * @param cache - The cache object to update.
 * @param filePath - The path of the file to read.
 */
export async function updateFilesCache(
  cache: Record<string, CachedFile>,
  filePath: string,
) {
  try {
    const stat = await fsp.stat(filePath);
    if (stat.isFile()) {
      const content = await fsp.readFile(filePath, 'utf8');
      cache[filePath] = {
        content,
      };
      Logger.info(UserMessages.UPDATE_CACHE, filePath);
    }
  } catch (err: any) {
    Logger.error(UserMessages.READING_FILE_ERROR, filePath, err.message);
  }
}

/**
 * Updates the cache for all HTML and Templ files in a directory.
 * @param cache - The cache object to update.
 * @param directory - The directory to scan for files.
 */
export async function updateCacheForDirectory(
  cache: Record<string, CachedFile>,
  directory: string,
) {
  try {
    const files = await fsp.readdir(directory, { recursive: true });
    await Promise.all(
      files.map(async (file: any) => {
        const filePath = path.join(directory, file);
        if (filePath.endsWith('.templ') || filePath.endsWith('.html')) {
          await updateFilesCache(cache, filePath);
        }
      }),
    );
  } catch (err: any) {
    Logger.error(UserMessages.READING_DIR_ERROR, err.message);
  }
}

/**
 * Retrieves the content of a cached file or updates the cache if necessary.
 *
 * @param {Record<string, CachedFile>} fileCache - The file cache.
 * @param {string} filePath - The path of the file to retrieve.
 * @param {string} defaultContent - The default content if the file is not cached.
 * @returns {string} - The content of the cached file or the default content.
 */
export function getCachedFileContent(
  fileCache: Record<string, CachedFile>,
  filePath: string,
  defaultContent: string,
): string {
  if (fileCache[filePath]) {
    return (fileCache[filePath] as CachedFile).content;
  } else {
    updateFilesCache(fileCache, filePath).then(() => {
      return (fileCache[filePath] as CachedFile)?.content || defaultContent;
    });
  }
  return defaultContent;
}

/**
 * Watches for changes in a file and adds the file to the watched files list.
 *
 * @param {Record<string, Set<string>>} watchedMdFiles - The watched markdown files.
 * @param {string} filePath - The path of the file to watch.
 * @param {string} id - The id of the markdown file.
 */
export function watchFileChanges(
  watchedMdFiles: Record<string, Set<string>>,
  filePath: string,
  id: string,
): void {
  if (!watchedMdFiles[filePath]) {
    watchedMdFiles[filePath] = new Set();
  }
  watchedMdFiles[filePath].add(id);
}

/**
 * Checks if the required binaries are installed on the system.
 * @param binaries - The list of binaries to check.
 */
export function checkBinaries(binaries: string[]): void {
  binaries.forEach((binary) => {
    const result = spawnSync('which', [binary]);
    if (result.status !== 0) {
      Logger.error(UserMessages.NO_BINARY, binary);
      throw new Error(
        `[vitepress-templ-preview] ${UserMessages.NO_BINARY.headline}: ${UserMessages.NO_BINARY.message} "${binary}`,
      );
    }
  });
}

/**
 * Executes a command synchronously.
 * @param command - The command string to execute.
 */
export function executeCommandSync(command: string): void {
  Logger.info(UserMessages.EXEC_SYSTEM_CMD, command);
  try {
    const stdout = execSync(command, { stdio: 'pipe' });
    if (stdout.toLocaleString() != '')
      Logger.info(<UserMessage>{ message: stdout.toLocaleString() });
  } catch (error: any) {
    Logger.error(UserMessages.EXEC_SYSTEM_CMD_ERROR, error.message);
    if (error.stderr) {
      Logger.error(UserMessages.GENERIC_ERROR, error.stderr.toString());
    }
    throw error; // Re-throw the error to ensure it can be handled by the caller if necessary
  }
}

/**
 * Updates the file cache and invalidates modules to trigger re-rendering.
 * @param serverRoot - The root directory of the server.
 * @param finalOptions - The final options for the plugin.
 * @param fileCache - The cache for file content.
 * @param watchedMdFiles - The watched markdown files.
 * @param server - The Vite server instance.
 * @param isFirstServerRun - Flag to indicate if this is from the first run of the server.
 */
async function updateCacheAndInvalidate(
  serverRoot: string,
  finalOptions: PluginConfig,
  fileCache: Record<string, CachedFile>,
  watchedMdFiles: Record<string, Set<string>>,
  server: any,
  isFirstServerRun: boolean = true,
): Promise<void> {
  const resolvedFinalOptions: Partial<PluginConfig> = {
    goProjectDir: finalOptions.goProjectDir,
    inputDir: path.join(finalOptions.goProjectDir, finalOptions.inputDir!),
    outputDir: path.join(finalOptions.goProjectDir, finalOptions.outputDir!),
  };

  const templResolvedPath = path.resolve(
    serverRoot,
    resolvedFinalOptions.inputDir!,
  );

  let htmlResolvedPath = '';

  const dir =
    finalOptions.mode === 'bundle'
      ? resolvedFinalOptions.outputDir
      : finalOptions.mode === 'inline'
        ? resolvedFinalOptions.inputDir
        : null;

  if (dir) {
    htmlResolvedPath = path.resolve(serverRoot, dir);
  }

  if (isFirstServerRun) {
    Logger.info(UserMessages.WATCHING_FILES, templResolvedPath);
    server.watcher.add(path.join(templResolvedPath, '**', '*.templ'));
  }

  // Ensure cache is updated after HTML files are generated
  await updateCacheForDirectory(fileCache, htmlResolvedPath);
  await updateCacheForDirectory(fileCache, templResolvedPath);

  // Invalidate modules to trigger re-rendering
  for (const file in watchedMdFiles) {
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
}

/**
 * Executes a command to generate HTML files and then updates the file cache and invalidates modules.
 * @param command - The command string to execute.
 * @param serverRoot - The root directory of the server.
 * @param finalOptions - The final options for the plugin.
 * @param fileCache - The cache for file content.
 * @param watchedMdFiles - The watched markdown files.
 * @param server - The Vite server instance.
 * @param isFirstServerRun - Flag to indicate if this is from the first run of the server.
 */
export async function executeAndUpdateCache(
  command: string,
  serverRoot: string,
  finalOptions: PluginConfig,
  fileCache: Record<string, CachedFile>,
  watchedMdFiles: Record<string, Set<string>>,
  server: any,
  isFirstServerRun: boolean = true,
) {
  executeCommandSync(command);
  await updateCacheAndInvalidate(
    serverRoot,
    finalOptions,
    fileCache,
    watchedMdFiles,
    server,
    isFirstServerRun,
  );
}

/**
 * Escapes special characters in a string to make it safe for inclusion in a JSON string,
 * including replacing single quotes with escaped double quotes.
 *
 * @param {string} str - The input string to be escaped.
 * @returns {string} - The escaped string, safe for inclusion in JSON.
 *
 * @example
 * const unsafeString = 'This is a "test" string with \\ special characters \n and newlines.';
 * const safeString = escapeForJSON(unsafeString);
 * console.log(safeString); // Output: This is a \"test\" string with \\ special characters \\n and newlines.
 */
export function escapeForJSON(str: string): string {
  return str
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/'/g, '\\"') // Replace single quotes with escaped double quotes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(/\t/g, '\\t') // Escape tabs
    .replace(/</g, '\\u003C') // Escape less-than sign
    .replace(/>/g, '\\u003E'); // Escape greater-than sign
}

/**
 * Unescapes a string that was previously escaped for JSON,
 * converting escaped sequences back to their original characters.
 *
 * @param {string} str - The input string to be unescaped.
 * @returns {string} - The unescaped string.
 *
 * @example
 * const escapedString = 'This is a \\"test\\" string with \\\\ special characters \\n and newlines.';
 * const unescapedString = unescapeFromJSON(escapedString);
 * console.log(unescapedString); // Output: This is a "test" string with \ special characters \n and newlines.
 */
export function unescapeFromJSON(str: string): string {
  return str
    .replace(/\\u003C/g, '<') // Unescape less-than sign
    .replace(/\\u003E/g, '>') // Unescape greater-than sign
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r') // Unescape carriage returns
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

/**
 * Extracts the inner code from templated blocks.
 *
 * This function takes an array of templated blocks and extracts only the inner code within the braces.
 *
 * @param {string[]} templBlocks - An array of strings, each containing a full templated block.
 * @returns {string[]} An array of strings, each containing only the inner code of the templated block.
 *
 * @example
 * const templBlocks = [
 *   "package main\\n\\nimport (\\n\\"fmt\\"\\n\\"log\\"\\n)\\ntempl AlertDemo() {\\n\\t@alertCss()\\n\\t@alert(\\"Success\\", \\"Files were successfully uploaded\\")\\n}"
 * ];
 * const result = extractInnerCode(templBlocks);
 * console.log(result);
 * // Output:
 * // [
 * //   "@alertCss()\\n  @alert(\\"Success\\", \\"Files were successfully uploaded\\")"
 * // ]
 */
export function extractInnerCode(templBlocks: string[]): string[] {
  return templBlocks.map((block) => {
    const startIndex = block.indexOf('{') + 1;
    const endIndex = block.lastIndexOf('}');
    return block.slice(startIndex, endIndex).trim();
  });
}
