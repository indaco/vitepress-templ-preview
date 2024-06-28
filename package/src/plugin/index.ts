import type {
  PluginOptions,
  PluginContext,
  CachedFile,
  TagAttrs,
  VTPComponentProps,
  ButtonStyle,
} from "../types";
import * as fs from "node:fs";
import path from "node:path";
import { Plugin, ResolvedConfig } from "vite";
import MarkdownIt from "markdown-it";
import { Token } from "markdown-it/index.js";
import {
  checkBinaries,
  escapeForJSON,
  executeAndUpdateCache,
  executeCommand,
  logger,
  unescapeFromJSON,
  updateFilesCache,
} from "../utils";
import { ThemeOptions } from "vitepress";
import { consola } from "consola";

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
 * @param serverRoot - The root directory of the server.
 * @param inputDir - The input directory for Templ files.
 * @param outputDir - The output directory for HTML files.
 * @param debug - keep the `static-templ` generation script after completion.
 * @returns The command string.
 */
function buildCommandStr(
  serverRoot: string,
  inputDir: string,
  outputDir: string,
  debug = false,
): string {
  return `cd ${serverRoot}/${DEFAULT_PROJECT_FOLDER} && ${STATIC_TEMPL_PLUS_BIN} -i ${inputDir} -o ${outputDir} -g=true -d=${debug}`;
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
    title: md.utils.escapeHtml(props.title),
    codeContent: unescapeFromJSON(props.codeContent),
    htmlContent: md.utils.unescapeAll(props.htmlContent),
    buttonStyle: md.utils.escapeHtml(props.buttonStyle),
    themes: props.themes,
  };

  return `<templ-preview-component v-bind='${JSON.stringify(
    _props,
  )}'></templ-preview-component>`;
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
    finalOptions.inputDir ||
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

  if (serverCommand === "serve") {
    if (fileCache[htmlFilePath]) {
      htmlContent = (fileCache[htmlFilePath] as CachedFile).content;
    } else {
      updateFilesCache(fileCache, htmlFilePath).then(() => {
        htmlContent =
          (fileCache[htmlFilePath] as CachedFile)?.content || htmlContent;
      });
    }

    if (fileCache[templFilePath]) {
      codeContent = (fileCache[templFilePath] as CachedFile).content;
    } else {
      updateFilesCache(fileCache, templFilePath).then(() => {
        codeContent =
          (fileCache[templFilePath] as CachedFile)?.content || codeContent;
      });
    }

    if (!watchedMdFiles[htmlFilePath]) {
      watchedMdFiles[htmlFilePath] = new Set();
    }
    watchedMdFiles[htmlFilePath].add(id);

    if (!watchedMdFiles[templFilePath]) {
      watchedMdFiles[templFilePath] = new Set();
    }
    watchedMdFiles[templFilePath].add(id);
  } else if (serverCommand === "build") {
    htmlContent = fs.readFileSync(htmlFilePath, "utf8");
    codeContent = fs.readFileSync(templFilePath, "utf8");
  }

  const props: VTPComponentProps = {
    title: md.utils.escapeHtml(titleValue),
    codeContent: escapeForJSON(codeContent),
    htmlContent: md.utils.escapeHtml(htmlContent),
    buttonStyle: buttonStyleValue as ButtonStyle,
    themes: themesValue as ThemeOptions,
  };

  return generateTemplPreviewComponentHtml(md, props);
}

const viteTemplPreviewPlugin = (options: PluginOptions = {}): Plugin => {
  const defaultOptions: PluginOptions = {
    projectDir: DEFAULT_PROJECT_FOLDER,
    inputDir: DEFAULT_TEMPL_FOLDER,
    outputDir: DEFAULT_OUTPUT_FOLDER,
  };
  const finalOptions: PluginOptions = { ...defaultOptions, ...options };

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
      checkBinaries([TEMPL_BIN, STATIC_TEMPL_PLUS_BIN]);
      const cmd = buildCommandStr(
        serverRoot,
        finalOptions.inputDir!,
        finalOptions.outputDir!,
        finalOptions.debug!,
      );

      await executeCommand(cmd);
    },
    async configureServer(server) {
      if (serverCommand === "serve") {
        checkBinaries([TEMPL_BIN, STATIC_TEMPL_PLUS_BIN]);
        const cmd = buildCommandStr(
          serverRoot,
          finalOptions.inputDir!,
          finalOptions.outputDir!,
          finalOptions.debug!,
        );
        executeAndUpdateCache(
          cmd,
          serverRoot,
          finalOptions,
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
          logger.info(`[vitepress-templ-preview] File changed: ${file}`);
          const cmd = buildCommandStr(
            serverRoot,
            finalOptions.inputDir!,
            finalOptions.outputDir!,
            finalOptions.debug!,
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
      }
    },
    async transform(code, id) {
      if (!id.endsWith(".md")) return;

      // Check if the markdown contains the templ demo parameters
      if (!TEMPL_DEMO_REGEX.test(code)) return;

      const context: PluginContext = {
        md,
        serverRoot,
        finalOptions: {
          inputDir: path.join(finalOptions.projectDir!, finalOptions.inputDir!),
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
