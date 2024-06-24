import type {
  PluginOptions,
  PluginContext,
  CachedFile,
  TagAttrs,
  VTPComponentProps,
  ButtonStyle,
} from "../types";
import fs from "node:fs/promises";
import path from "node:path";
import { exec, spawnSync } from "node:child_process";
import { Plugin } from "vite";
import MarkdownIt from "markdown-it";
import { Token } from "markdown-it/index.js";
import { escapeForJSON } from "../utils";
import { ThemeOptions } from "vitepress";

const TEMPL_DEMO_REGEX = /<templ-demo\s+([^>]+?)\/?>/;
const DEFAULT_PROJECT_FOLDER = "templ-preview";
const DEFAULT_TEMPL_FOLDER = "demos";
const DEFAULT_OUTPUT_FOLDER = "output";

const TEMPL_BIN = "templ";
const STATIC_TEMPL_PLUS_BIN = "static-templ";

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
 * Generates the HTML for the templ preview component.
 * @param md - The MarkdownIt instance.
 * @param title - The title of the preview.
 * @param codeContent - The content of the code.
 * @param htmlContent - The content of the HTML file.
 * @returns The HTML string for the templ preview component.
 */
function generateTemplPreviewComponentHtml(
  md: MarkdownIt,
  props: VTPComponentProps,
): string {
  const _props = {
    title: md.utils.escapeHtml(props.title),
    codeContent: escapeForJSON(props.codeContent),
    htmlContent: escapeForJSON(props.htmlContent),
    buttonStyle: md.utils.escapeHtml(props.buttonStyle),
    themes: props.themes,
  };

  return `<templ-preview-component v-bind='${JSON.stringify(
    _props,
  )}'></templ-preview-component>`;
}

/**
 * Updates the cache for a specific file by reading its content.
 * @param cache - The cache object to update.
 * @param filePath - The path of the file to read.
 */
async function updateFilesCache(
  cache: Record<string, CachedFile>,
  filePath: string,
) {
  try {
    const stat = await fs.stat(filePath);
    if (stat.isFile()) {
      const content = await fs.readFile(filePath, "utf8");
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
async function updateCacheForDirectory(
  cache: Record<string, CachedFile>,
  directory: string,
) {
  try {
    const files = await fs.readdir(directory);
    await Promise.all(
      files.map(async (file) => {
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
 * Creates a new token with the parsed attributes.
 * @param state - The state object from markdown-it.
 * @param attrs - The attributes to add to the token.
 * @returns The created token.
 */
function createTemplDemoToken(state: any, attrs: TagAttrs) {
  const token = new state.Token("templ_demo", "templ-demo", 0);
  token.attrs = Object.keys(attrs).map((key) => [key, attrs[key]]);
  return token;
}

/**
 * Processes the tokens and replaces the matched custom tag.
 * @param state - The state object from markdown-it.
 */
function processTokens(state: any) {
  const tokens = state.tokens;
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === "inline") {
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
 * @param tokens - The markdown-it tokens.
 * @param idx - The index of the current token.
 * @param context - The plugin context.
 * @param id - The id of the markdown file.
 * @returns The HTML string for the templ preview component.
 */
function renderTemplPreview(
  tokens: Token[],
  idx: number,
  context: PluginContext,
  id: string,
): string {
  const token = tokens[idx];
  const { md, serverRoot, finalOptions, fileCache, watchedMdFiles } = context;

  const srcAttr = token.attrs?.find((attr) => attr[0] === "src");
  const titleAttr = token.attrs?.find((attr) => attr[0] === "title");
  const buttonAttr = token.attrs?.find(
    (attr) => attr[0] === "data-button-variant",
  );
  const lightThemeAttr = token.attrs?.find(
    (attr) => attr[0] === "data-theme-light",
  );
  const darkThemeAttr = token.attrs?.find(
    (attr) => attr[0] === "data-theme-dark",
  );

  const srcValue = srcAttr ? srcAttr[1] : "";
  const titleValue = titleAttr ? titleAttr[1] : "";
  const buttonStyleValue = buttonAttr ? buttonAttr[1] : "alt";
  const lightThemeValue = lightThemeAttr ? lightThemeAttr[1] : "github-light";
  const darkThemeValue = darkThemeAttr ? darkThemeAttr[1] : "github-dark";
  const themesValue = {
    light: lightThemeValue,
    dark: darkThemeValue,
  };

  const templFilePath = path.resolve(
    serverRoot,
    finalOptions.templDir ||
      path.join(DEFAULT_PROJECT_FOLDER, DEFAULT_TEMPL_FOLDER),
    `${srcValue}.templ`,
  );
  const htmlFilePath = path.resolve(
    serverRoot,
    finalOptions.outputDir ||
      path.join(DEFAULT_PROJECT_FOLDER, DEFAULT_OUTPUT_FOLDER),
    `${srcValue}.html`,
  );

  let htmlContent = "Loading..."; // Default placeholder
  let codeContent = token.content;

  if (fileCache[htmlFilePath]) {
    htmlContent = (fileCache[htmlFilePath] as CachedFile).content;
  } else {
    updateFilesCache(fileCache, htmlFilePath);
    htmlContent =
      (fileCache[htmlFilePath] as CachedFile)?.content || htmlContent;
  }

  if (fileCache[templFilePath]) {
    codeContent = (fileCache[templFilePath] as CachedFile).content;
  } else {
    updateFilesCache(fileCache, templFilePath);
    codeContent =
      (fileCache[templFilePath] as CachedFile)?.content || codeContent;
  }

  if (!watchedMdFiles[htmlFilePath]) {
    watchedMdFiles[htmlFilePath] = new Set();
  }
  watchedMdFiles[htmlFilePath].add(id);

  if (!watchedMdFiles[templFilePath]) {
    watchedMdFiles[templFilePath] = new Set();
  }
  watchedMdFiles[templFilePath].add(id);

  const props: VTPComponentProps = {
    title: titleValue,
    codeContent: codeContent,
    htmlContent: htmlContent,
    buttonStyle: buttonStyleValue as ButtonStyle,
    themes: themesValue as ThemeOptions,
  };

  return generateTemplPreviewComponentHtml(md, props);
}

/**
 * Checks if the required binaries are installed on the system.
 * @param binaries - The list of binaries to check.
 */
function checkBinaries(binaries: string[]): void {
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
 * Builds the command string for generating HTML files from Templ files.
 * @param serverRoot - The root directory of the server.
 * @param inputDir - The input directory for Templ files.
 * @param outputDir - The output directory for HTML files.
 * @returns The command string.
 */
function buildCommandStr(
  serverRoot: string,
  inputDir: string,
  outputDir: string,
): string {
  return `cd ${serverRoot}/${DEFAULT_PROJECT_FOLDER} && ${STATIC_TEMPL_PLUS_BIN} -i ${inputDir} -o ${outputDir} -g=true`;
}

/**
 * Executes a command to generate HTML files, updates the file cache,
 * and invalidates modules to trigger re-rendering.
 * @param command - The command string to execute.
 * @param serverRoot - The root directory of the server.
 * @param finalOptions - The final options for the plugin.
 * @param fileCache - The cache for file content.
 * @param watchedMdFiles - The watched markdown files.
 * @param server - The Vite server instance.
 * @param isFirstServerRun - Flag to indicate if this is from the first run of the server.
 */
function executeAndUpdateCache(
  command: string,
  serverRoot: string,
  finalOptions: PluginOptions,
  fileCache: Record<string, CachedFile>,
  watchedMdFiles: Record<string, Set<string>>,
  server: any,
  isFirstServerRun: boolean = true,
) {
  const resolvedFinalOptions: PluginOptions = {
    templDir: path.join(finalOptions.projectDir!, finalOptions.templDir!),
    outputDir: path.join(finalOptions.projectDir!, finalOptions.outputDir!),
  };

  exec(command, async (error, stdout, stderr) => {
    if (error) {
      console.error(
        `[vitepress-templ-preview] Error executing command: ${error.message}`,
      );
      return;
    }
    if (stderr) {
      console.error(`[vitepress-templ-preview] Error: ${stderr}`);
      return;
    }
    console.log(stdout);

    const templResolvedPath = path.resolve(
      serverRoot,
      resolvedFinalOptions.templDir!,
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
  });
}

const viteTemplPreviewPlugin = (options: PluginOptions = {}): Plugin => {
  const defaultOptions: PluginOptions = {
    projectDir: DEFAULT_PROJECT_FOLDER,
    templDir: DEFAULT_TEMPL_FOLDER,
    outputDir: DEFAULT_OUTPUT_FOLDER,
  };
  const finalOptions: PluginOptions = { ...defaultOptions, ...options };

  const md = new MarkdownIt();
  const fileCache: Record<string, CachedFile> = {};
  const watchedMdFiles: Record<string, Set<string>> = {};

  let serverRoot = "";
  return {
    name: "vite:templ-preview",
    enforce: "pre",
    async configureServer(server) {
      serverRoot = server.config.root;

      // Check for required binaries at server startup
      checkBinaries([TEMPL_BIN, STATIC_TEMPL_PLUS_BIN]);

      const cmd = buildCommandStr(
        serverRoot,
        finalOptions.templDir!,
        finalOptions.outputDir!,
      );
      executeAndUpdateCache(
        cmd,
        serverRoot,
        finalOptions,
        fileCache,
        watchedMdFiles,
        server,
      );
    },
    handleHotUpdate(ctx) {
      const { file, server, modules } = ctx;

      if (file.endsWith(".templ")) {
        console.log(`[vitepress-templ-preview] File changed: ${file}`);
        const cmd = buildCommandStr(
          serverRoot,
          finalOptions.templDir!,
          finalOptions.outputDir!,
        );
        executeAndUpdateCache(
          cmd,
          serverRoot,
          finalOptions,
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
            type: "full-reload",
          });
        }, 500);
      }
      return modules;
    },
    async transform(code, id) {
      if (!id.endsWith(".md")) return;

      // Check if the markdown contains the templ demo parameters
      if (!TEMPL_DEMO_REGEX.test(code)) return;

      const context: PluginContext = {
        md,
        serverRoot,
        finalOptions: {
          templDir: path.join(finalOptions.projectDir!, finalOptions.templDir!),
          outputDir: path.join(
            finalOptions.projectDir!,
            finalOptions.outputDir!,
          ),
        },
        fileCache,
        watchedMdFiles,
      };

      md.core.ruler.push("templ_demo", processTokens);
      md.renderer.rules.templ_demo = (tokens: Token[], idx: number) =>
        renderTemplPreview(tokens, idx, context, id);

      const rendered = md.render(code);
      if (!rendered.includes("templ-preview-component")) return;
      return {
        code: rendered,
        map: null,
      };
    },
  };
};

export default viteTemplPreviewPlugin;
