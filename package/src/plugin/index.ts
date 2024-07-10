import type {
  PluginConfig,
  PluginContext,
  CachedFile,
  TagAttrs,
  VTPComponentProps,
  ButtonStyle,
  VTPUserConfig,
} from "../types";
import * as fs from "node:fs";
import path from "node:path";
import { Plugin } from "vite";
import MarkdownIt from "markdown-it";
import { Token } from "markdown-it/index.js";
import {
  checkBinaries,
  escapeForJSON,
  executeAndUpdateCache,
  executeCommandSync,
  unescapeFromJSON,
  updateFilesCache,
} from "../utils";
import { BundledTheme } from "shiki";
import { Logger } from "../logger";

const TEMPL_DEMO_REGEX = /<templ-demo\s+([^>]+?)\/?>/;
const TEMPL_BIN = "templ";
const STATIC_TEMPL_PLUS_BIN = "static-templ-plus";

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
  const baseCmd = `cd ${serverRoot}/${resolvedOptions.goProjectDir} && ${STATIC_TEMPL_PLUS_BIN} -m ${resolvedOptions.mode} -i ${resolvedOptions.inputDir} -g=${resolvedOptions.runTemplGenerate} -d=${resolvedOptions.debug}`;

  if (resolvedOptions.mode === "bundle") {
    return `${baseCmd} -o ${resolvedOptions.outputDir}`;
  }

  return baseCmd;
}

/**
 * Generates the HTML for the templ preview component.
 * @param md - The MarkdownIt instance.
 * @param props - The properties for the preview component.
 * @returns The HTML string for the templ preview component.
 */
function generateTemplPreviewComponentHtml(
  md: MarkdownIt,
  props: VTPComponentProps,
): string {
  const _props = {
    codeContent: unescapeFromJSON(props.codeContent),
    htmlContent: md.utils.unescapeAll(props.htmlContent),
    buttonStyle: md.utils.escapeHtml(props.buttonStyle),
    themes: props.themes,
    isPreviewFirst: props.isPreviewFirst,
  };

  return `<templ-preview-component v-bind='${JSON.stringify(
    _props,
  )}'></templ-preview-component>`;
}

function handleOpMode(
  id: string,
  serverRoot: string,
  options: Partial<PluginConfig>,
  srcValue: string,
): {
  templFile: string;
  htmlFile: string;
} {
  let templFilePath = "";
  let htmlFilePath = "";

  const mode = options.mode!;
  switch (mode) {
    case "inline":
      templFilePath = path.resolve(path.dirname(id), `${srcValue}.templ`);
      htmlFilePath = path.resolve(path.dirname(id), `${srcValue}.html`);
      break;
    case "bundle":
      templFilePath = path.resolve(
        serverRoot,
        options.inputDir || path.join(options.goProjectDir!, options.inputDir!),
        `${srcValue}.templ`,
      );
      htmlFilePath = path.resolve(
        serverRoot,
        options.outputDir ||
          path.join(options.goProjectDir!, options.inputDir!),
        `${srcValue}.html`,
      );

      break;
    default:
      const errorMsg = `Unknown "${mode}"`;
      Logger.error("", errorMsg);
      throw new Error(`[vitepress-templ-preview] ${errorMsg}.`);
  }

  return {
    templFile: templFilePath,
    htmlFile: htmlFilePath,
  };
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
  serverCommand: "build" | "serve",
  tokens: Token[],
  idx: number,
  context: PluginContext,
  id: string,
): string {
  const token = tokens[idx];
  const { md, serverRoot, pluginOptions, fileCache, watchedMdFiles } = context;

  // Mandatory attribute on the tag.
  const srcAttr = token.attrs?.find((attr) => attr[0] === "src");
  // Throw an error if srcAttr is not set or srcAttr[1] is empty.
  if (!srcAttr || !srcAttr[1]) {
    const errorMsg =
      "[vitepress-templ-preview] Error: The 'src' attribute is required and must not be empty.";
    Logger.error("", errorMsg);

    throw new Error(errorMsg);
  }

  // Options are handles as `data-*` props.
  const buttonAttr = token.attrs?.find(
    (attr) => attr[0] === "data-button-variant",
  );
  const lightThemeAttr = token.attrs?.find(
    (attr) => attr[0] === "data-theme-light",
  );
  const darkThemeAttr = token.attrs?.find(
    (attr) => attr[0] === "data-theme-dark",
  );
  const isPreviewFirstAttr = token.attrs?.find(
    (attr) => attr[0] === "data-preview-first",
  );

  // Retrieving attribute values
  const srcValue = srcAttr[1];
  const buttonStyleValue = buttonAttr ? buttonAttr[1] : "alt";
  const lightThemeValue = (
    lightThemeAttr ? lightThemeAttr[1] : "github-light"
  ) as BundledTheme;
  const darkThemeValue = (
    darkThemeAttr ? darkThemeAttr[1] : "github-dark"
  ) as BundledTheme;
  const themesValue = {
    light: lightThemeValue,
    dark: darkThemeValue,
  };
  const isPreviewFirstValue = isPreviewFirstAttr
    ? JSON.parse(isPreviewFirstAttr[1].toLowerCase())
    : true;

  const resolvedPaths = handleOpMode(id, serverRoot, pluginOptions, srcValue);

  let htmlContent = "Loading..."; // Default placeholder
  let codeContent = token.content;

  if (serverCommand === "serve") {
    if (fileCache[resolvedPaths.htmlFile]) {
      htmlContent = (fileCache[resolvedPaths.htmlFile] as CachedFile).content;
    } else {
      updateFilesCache(fileCache, resolvedPaths.htmlFile).then(() => {
        htmlContent =
          (fileCache[resolvedPaths.htmlFile] as CachedFile)?.content ||
          htmlContent;
      });
    }

    if (fileCache[resolvedPaths.templFile]) {
      codeContent = (fileCache[resolvedPaths.templFile] as CachedFile).content;
    } else {
      updateFilesCache(fileCache, resolvedPaths.templFile).then(() => {
        codeContent =
          (fileCache[resolvedPaths.templFile] as CachedFile)?.content ||
          codeContent;
      });
    }

    if (!watchedMdFiles[resolvedPaths.htmlFile]) {
      watchedMdFiles[resolvedPaths.htmlFile] = new Set();
    }
    watchedMdFiles[resolvedPaths.htmlFile].add(id);

    if (!watchedMdFiles[resolvedPaths.templFile]) {
      watchedMdFiles[resolvedPaths.templFile] = new Set();
    }
    watchedMdFiles[resolvedPaths.templFile].add(id);
  } else if (serverCommand === "build") {
    htmlContent = fs.readFileSync(resolvedPaths.htmlFile, "utf8");
    codeContent = fs.readFileSync(resolvedPaths.templFile, "utf8");
  }

  const props: VTPComponentProps = {
    codeContent: escapeForJSON(codeContent),
    htmlContent: md.utils.escapeHtml(htmlContent),
    buttonStyle: buttonStyleValue as ButtonStyle,
    themes: themesValue,
    isPreviewFirst: isPreviewFirstValue,
  };

  return generateTemplPreviewComponentHtml(md, props);
}

// Default values for the PluginOptions
const defaultPluginOptions: PluginConfig = {
  goProjectDir: "",
  mode: "inline",
  inputDir: "demos",
  outputDir: "output",
  debug: false,
  runTemplGenerate: true,
};

const viteTemplPreviewPlugin = (options?: VTPUserConfig): Plugin => {
  const resolvedPluginOptions: PluginConfig = {
    ...defaultPluginOptions,
    ...options,
  };

  const md = new MarkdownIt();
  const fileCache: Record<string, CachedFile> = {};
  const watchedMdFiles: Record<string, Set<string>> = {};

  let serverRoot: string;
  let serverCommand: "build" | "serve";
  return {
    name: "vite:templ-preview",
    enforce: "pre",
    configResolved(resolvedConfig) {
      serverRoot = resolvedConfig.root;
      serverCommand = resolvedConfig.command;
    },
    async buildStart() {
      checkBinaries([STATIC_TEMPL_PLUS_BIN]);

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
    },
    async configureServer(server) {
      if (serverCommand === "serve") {
        checkBinaries([STATIC_TEMPL_PLUS_BIN]);

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
        executeAndUpdateCache(
          staticTemplcmd,
          serverRoot,
          resolvedPluginOptions,
          fileCache,
          watchedMdFiles,
          server,
        );
      }
    },
    handleHotUpdate(ctx) {
      if (serverCommand === "serve") {
        const { file, server, modules } = ctx;

        if (file.endsWith(".templ")) {
          Logger.info("File changed", file);
          const cmd = buildStaticTemplCommandStr(
            serverRoot,
            resolvedPluginOptions,
          );
          executeAndUpdateCache(
            cmd,
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
              type: "full-reload",
            });
          }, 500);
        }
        return modules;
      }
    },
    async transform(code, id) {
      if (!id.endsWith(".md")) return;

      // Check if the markdown contains the templ demo parameters
      if (!TEMPL_DEMO_REGEX.test(code)) return;

      const context: PluginContext = {
        md,
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
      };

      md.core.ruler.push("templ_demo", processTokens);
      md.renderer.rules.templ_demo = (tokens: Token[], idx: number) =>
        renderTemplPreview(serverCommand, tokens, idx, context, id);

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
