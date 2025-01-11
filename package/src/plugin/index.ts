/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PluginContext, UserMessage, VTPUserConfig } from '../types';
import path from 'node:path';
import { Plugin, ResolvedConfig } from 'vite';
import { createMarkdownRenderer, MarkdownRenderer } from 'vitepress';
import { UserMessages } from '../user-messages';
import { Logger } from '../logger';
import { CacheService } from '../cache-service';
import HtmlStylesOptimizer from '../styles-optimizer';
import HtmlScriptsOptimizer from '../scripts-optimizer';
import { BundledTheme } from 'shiki';
import { TemplTaskRunner } from './templ-runner';
import { executeCommandSync } from '../utils';
import { ConfigResolver } from './config';
import { CommandBuilder } from './command-builder';
import { MarkdownProcessor } from './md-processor';

type ServerCommand = 'build' | 'serve';
type ThemeConfig = { light: BundledTheme; dark: BundledTheme };

const DefaultThemes: ThemeConfig = {
  light: 'github-light',
  dark: 'github-dark',
} as const;

function optimizeAssets(
  stylesOptimizer: HtmlStylesOptimizer,
  scriptsOptimizer: HtmlScriptsOptimizer,
) {
  Logger.info(UserMessages.CSS_OPTIMIZER);
  stylesOptimizer.run();

  Logger.info(UserMessages.JS_OPTIMIZER);
  scriptsOptimizer.run();
}

async function viteTemplPreviewPlugin(
  options?: VTPUserConfig,
): Promise<Plugin> {
  const resolvedOptions = ConfigResolver.resolve(options);
  // Initialize CacheService with default cache size
  const cacheService = new CacheService(resolvedOptions.cacheSize);

  let taskRunner: TemplTaskRunner;
  let markdownProcessor: MarkdownProcessor;
  let serverRoot: string;
  let serverCommand: ServerCommand;
  let stylesOptimizer: HtmlStylesOptimizer;
  let scriptsOptimizer: HtmlScriptsOptimizer;

  return {
    name: 'vite:templ-preview',
    enforce: 'pre',
    async configResolved(config: ResolvedConfig) {
      serverRoot = config.root;
      serverCommand = config.command;
      taskRunner = new TemplTaskRunner(serverRoot, resolvedOptions);

      const vitepressConfig = (config as any).vitepress;
      if (!vitepressConfig) {
        Logger.errorHighlighted(UserMessages.GENERIC_ERROR);
        throw new Error(
          `[vitepress-templ-preview] ${UserMessages.GENERIC_ERROR.headline} ${UserMessages.GENERIC_ERROR.message} -> in configResolved`,
        );
      }

      const inputDirectory = path.join(serverRoot, resolvedOptions.inputDir);

      const userThemes: Partial<typeof DefaultThemes> =
        vitepressConfig.markdown.theme || {};

      const mdInstance: MarkdownRenderer = await createMarkdownRenderer(
        vitepressConfig.srcDir,
        vitepressConfig.markdown,
        vitepressConfig.base,
        vitepressConfig.logger,
      );

      stylesOptimizer = HtmlStylesOptimizer.getInstance(inputDirectory);
      scriptsOptimizer = HtmlScriptsOptimizer.getInstance(inputDirectory);

      const context: PluginContext = {
        md: mdInstance,
        serverRoot,
        pluginOptions: {
          ...resolvedOptions,
          inputDir: path.join(
            resolvedOptions.goProjectDir!,
            resolvedOptions.inputDir!,
          ),
          outputDir: path.join(
            resolvedOptions.goProjectDir!,
            resolvedOptions.outputDir!,
          ),
        },
        theme: { ...DefaultThemes, ...userThemes },
        serverCommand,
        cacheService,
      };

      markdownProcessor = new MarkdownProcessor(mdInstance, context);
    },

    async buildStart() {
      // Run templ fmt and templ generate
      taskRunner.run();

      // Consolidate html style and script tags across static-templ generated html files
      optimizeAssets(stylesOptimizer, scriptsOptimizer);
    },
    async configureServer(server) {
      if (serverCommand === 'serve') {
        // Run templ fmt and templ generate
        taskRunner.run();

        // Consolidate html style and script tags across static-templ generated html files
        optimizeAssets(stylesOptimizer, scriptsOptimizer);

        // Use CacheService to update cache and invalidate
        cacheService.updateCacheAndInvalidate(
          server,
          serverRoot,
          resolvedOptions,
          true,
        );
      }
    },
    handleHotUpdate(ctx) {
      if (serverCommand === 'serve') {
        const { file, server, modules } = ctx;

        if (file.endsWith('.templ')) {
          Logger.info(<UserMessage>{ headline: 'File changed', message: file });
          const cmd = CommandBuilder.buildStaticTemplCommand(
            serverRoot,
            resolvedOptions,
          );
          executeCommandSync(cmd);

          // Consolidate html style and script tags across static-templ generated html files
          optimizeAssets(stylesOptimizer, scriptsOptimizer);

          // Use CacheService to update the cache after file change
          cacheService.updateCacheAndInvalidate(
            server,
            serverRoot,
            resolvedOptions,
          );

          // Cache updated and client reloaded
          cacheService.handleFileChange(server, file);
        }
        return modules;
      }
    },
    async transform(code, id) {
      return markdownProcessor.transform(code, id);
    },
  };
}

export default viteTemplPreviewPlugin;
