/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  PluginConfig,
  PluginContext,
  UserMessage,
  VTPUserConfig,
} from '../types';
import path from 'node:path';
import { Plugin } from 'vite';
import { createMarkdownRenderer, MarkdownOptions } from 'vitepress';
import markdownItTemplPreviewPlugin from './markdown-it-templ-preview';
import MarkdownIt from 'markdown-it';
import { UserMessages } from '../user-messages';
import { checkBinaries, executeCommandSync } from '../utils';
import { Logger } from '../logger';
import { CacheService } from '../cache-service';
import HtmlStylesOptimizer from '../styles-optimizer';
import HtmlScriptsOptimizer from '../scripts-optimizer';
import { BundledTheme } from 'shiki';

const TEMPL_DEMO_REGEX = /<templ-demo\s+([^>]+?)\/?>/;
const TEMPL_BIN = 'templ';
const STATIC_TEMPL_BIN = 'static-templ';

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

// Default values for the PluginOptions
const defaultPluginOptions: PluginConfig = {
  goProjectDir: '',
  mode: 'inline',
  inputDir: 'components',
  outputDir: 'output',
  debug: false,
  runTemplGenerate: true,
  cacheSize: 100,
};

async function viteTemplPreviewPlugin(
  options?: VTPUserConfig,
): Promise<Plugin> {
  const resolvedPluginOptions: PluginConfig = {
    ...defaultPluginOptions,
    ...options,
  };

  const defaultThemes: { light: BundledTheme; dark: BundledTheme } = {
    light: 'github-light',
    dark: 'github-dark',
  };

  // Initialize CacheService with default cache size
  const cacheService = new CacheService(resolvedPluginOptions.cacheSize);

  let mdInstance: MarkdownIt;
  let serverRoot: string;
  let serverCommand: 'build' | 'serve';
  let userThemes: any;
  let stylesOptimizer: HtmlStylesOptimizer;
  let scriptsOptimizer: HtmlScriptsOptimizer;

  return {
    name: 'vite:templ-preview',
    enforce: 'pre',
    async configResolved(config) {
      const vitepressConfig = (config as any).vitepress;
      if (!vitepressConfig) {
        Logger.errorHighlighted(UserMessages.GENERIC_ERROR);
        throw new Error(
          `[vitepress-templ-preview] ${UserMessages.GENERIC_ERROR.headline} ${UserMessages.GENERIC_ERROR.message} -> in configResolvd`,
        );
      }

      const md = await createMarkdownRenderer(
        vitepressConfig.srcDir,
        vitepressConfig.markdown,
        vitepressConfig.base,
        vitepressConfig.logger,
      );
      mdInstance = md;

      if (!mdInstance) {
        Logger.errorHighlighted(UserMessages.MISSING_MARKDOWN_OBJ_ERROR);
        Logger.warning(UserMessages.MISSING_MARKDOWN_OBJ_HINT);
        throw new Error(
          `[vitepress-templ-preview] ${UserMessages.MISSING_MARKDOWN_OBJ_ERROR.headline} ${UserMessages.MISSING_MARKDOWN_OBJ_ERROR.message}`,
        );
      }

      const markdownOptions = (config as any).vitepress?.markdown;
      userThemes = (markdownOptions as MarkdownOptions).theme;

      serverRoot = config.root;
      serverCommand = config.command;
      const inputDirectory = path.join(
        serverRoot,
        resolvedPluginOptions.inputDir,
      );

      stylesOptimizer = HtmlStylesOptimizer.getInstance(inputDirectory);
      scriptsOptimizer = HtmlScriptsOptimizer.getInstance(inputDirectory);
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

        // Use CacheService to update cache and invalidate
        await cacheService.updateCacheAndInvalidate(
          server,
          serverRoot,
          resolvedPluginOptions,
          true,
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

          // Use CacheService to update the cache after file change
          cacheService.updateCacheAndInvalidate(
            server,
            serverRoot,
            resolvedPluginOptions,
          );

          setTimeout(() => {
            cacheService.watchFileChanges(file, file);

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

      if (!mdInstance) {
        Logger.errorHighlighted(UserMessages.MISSING_MARKDOWN_INSTANCE_ERROR);
        throw new Error(
          `[vitepress-templ-preview] ${UserMessages.MISSING_MARKDOWN_INSTANCE_ERROR.headline} ${UserMessages.MISSING_MARKDOWN_INSTANCE_ERROR.message}`,
        );
      }

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
        theme: { ...defaultThemes, ...userThemes },
        serverCommand,
        cacheService,
      };

      markdownItTemplPreviewPlugin(mdInstance, context, id);

      const rendered = mdInstance.render(code);
      if (!rendered.includes('VTPLivePreview')) return;
      return {
        code: rendered,
        map: null,
      };
    },
  };
}

export default viteTemplPreviewPlugin;
