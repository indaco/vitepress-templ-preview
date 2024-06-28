import { exec, spawnSync } from "node:child_process";
import { CachedFile, PluginOptions } from "./types";
import path from "node:path";
import * as fsp from "node:fs/promises";

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
      const content = await fsp.readFile(filePath, "utf8");
      cache[filePath] = {
        content,
      };
      console.log(`[vitepress-templ-preview] Updated cache for: ${filePath}`);
    }
  } catch (err: any) {
    console.error(
      `[vitepress-templ-preview] Error reading file ${filePath}: ${err.message}`,
    );
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
    const files = await fsp.readdir(directory);
    await Promise.all(
      files.map(async (file: any) => {
        const filePath = path.join(directory, file);
        if (filePath.endsWith(".templ") || filePath.endsWith(".html")) {
          await updateFilesCache(cache, filePath);
        }
      }),
    );
  } catch (err: any) {
    console.error(
      `[vitepress-templ-preview] Error reading directory ${directory}: ${err.message}`,
    );
  }
}

/**
 * Checks if the required binaries are installed on the system.
 * @param binaries - The list of binaries to check.
 */
export function checkBinaries(binaries: string[]): void {
  binaries.forEach((binary) => {
    const result = spawnSync("which", [binary]);
    if (result.status !== 0) {
      throw new Error(
        `[vitepress-templ-preview] Required binary "${binary}" is not installed or not found in PATH.`,
      );
    }
  });
}

/**
 * Executes a command.
 * @param command - The command string to execute.
 * @returns A promise that resolves when the command is complete.
 */
export function executeCommand(command: string): Promise<void> {
  console.log(`[vitepress-templ-preview] Executing system command: ${command}`);
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(
          `[vitepress-templ-preview] Error executing command: ${error.message}`,
        );
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`[vitepress-templ-preview] Error: ${stderr}`);
      }
      console.log(stdout);
      resolve();
    });
  });
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
  finalOptions: PluginOptions,
  fileCache: Record<string, CachedFile>,
  watchedMdFiles: Record<string, Set<string>>,
  server: any,
  isFirstServerRun: boolean = true,
): Promise<void> {
  const resolvedFinalOptions: PluginOptions = {
    inputDir: path.join(finalOptions.projectDir!, finalOptions.inputDir!),
    outputDir: path.join(finalOptions.projectDir!, finalOptions.outputDir!),
  };

  const templResolvedPath = path.resolve(
    serverRoot,
    resolvedFinalOptions.inputDir!,
  );

  const htmlResolvedPath = path.resolve(
    serverRoot,
    resolvedFinalOptions.outputDir!,
  );

  if (isFirstServerRun) {
    console.log(
      `[vitepress-templ-preview] Watching Templ files at: ${templResolvedPath}`,
    );
    server.watcher.add(path.join(templResolvedPath, "**/*.templ"));
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
    type: "full-reload",
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
  finalOptions: PluginOptions,
  fileCache: Record<string, CachedFile>,
  watchedMdFiles: Record<string, Set<string>>,
  server: any,
  isFirstServerRun: boolean = true,
) {
  await executeCommand(command);
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
    .replace(/\\/g, "\\\\") // Escape backslashes
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/'/g, '\\"') // Replace single quotes with escaped double quotes
    .replace(/\n/g, "\\n") // Escape newlines
    .replace(/\r/g, "\\r") // Escape carriage returns
    .replace(/\t/g, "\\t"); // Escape tabs
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
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}
