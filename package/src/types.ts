import MarkdownIt from 'markdown-it';
import { BundledTheme } from 'shiki';
import { CacheService } from './cache-service';

/**
 * The mode in which the static template plugin operates.
 * - 'bundle': Generates a bundled output.
 * - 'inline': Generates inline output.
 */
export type StaticTemplPlusMode = 'bundle' | 'inline';

/**
 * Interface representing the options for the vite-templ-preview plugin.
 */
export interface PluginConfig {
  /**
   * The root folder for the go templ project.
   * This is the base directory where your go module project is located.
   * @default ""
   */
  goProjectDir: string;

  /**
   * The working mode for the plugin : either `inline` or `bundle`
   * It affects the project structure and where the generated HTML files are saved.
   * @default "inline"
   */
  mode: StaticTemplPlusMode;

  /**
   * The input folder where the templ components are.
   * This is the directory relative to the projectDir where your .templ files are located.
   * @default "demos"
   */
  inputDir: string;

  /**
   * The output folder where the HTML files will be generated.
   * This is the directory relative to the projectDir where the generated HTML files will be placed.
   * @default "output"
   */
  outputDir: string;

  /**
   * Whether or not to keep the static-templ generation script after completion.
   * @default false
   */
  debug: boolean;

  /**
   * Whether the plugin should run the `templ generate` command for you.
   * @default true
   */
  runTemplGenerate: boolean;

  /**
   * The maximum number of files to cache.
   * @default 100
   */
  cacheSize: number;
}

/**
 * Partial configuration for the vite-templ-preview plugin,
 * allowing users to override specific options.
 */
export type VTPUserConfig = Partial<PluginConfig>;

/**
 * Context provided to the plugin, containing various utilities, options, and services.
 */
export interface PluginContext {
  /**
   * MarkdownIt instance for processing Markdown content.
   */
  md: MarkdownIt;

  /**
   * The root directory of the Vite server.
   */
  serverRoot: string;

  /**
   * Command that Vite is running ("build" or "serve").
   */
  serverCommand: 'build' | 'serve';

  /**
   * Options provided to the plugin.
   */
  pluginOptions: Partial<PluginConfig>;

  /**
   * Theme configuration for light and dark modes.
   */
  theme: { light: BundledTheme; dark: BundledTheme };

  /**
   * CacheService instance for managing file caching, file watching, and module invalidation.
   * This service provides methods to retrieve cached content, watch file changes, and invalidate modules.
   */
  cacheService: CacheService;
}

/**
 * Represents the attributes of an HTML tag.
 */
export interface TagAttrs {
  [key: string]: string;
}

/**
 * Options for extracting code details.
 */
export interface CodeExtractorOptions {
  /**
   * Whether to extract only exported Go symbols.
   */
  goExportedOnly?: boolean;

  /**
   * Whether to include Go package declarations.
   */
  goPackage?: boolean;

  /**
   * Whether to include Go imports.
   */
  goImports?: boolean;

  /**
   * Whether to include Go variable declarations.
   */
  goVars?: boolean;

  /**
   * Whether to include Go constant declarations.
   */
  goConsts?: boolean;

  /**
   * Whether to include Go type declarations.
   */
  goTypes?: boolean;
}

/**
 * Represents a user message with a headline and message content.
 */
export interface UserMessage {
  /**
   * The headline of the message.
   */
  headline: string;

  /**
   * The content of the message.
   */
  message: string;
}

/**
 * Styles available for buttons in the Vue rendering components.
 * - 'alt': Alternative style.
 * - 'brand': Brand style.
 */
export type ButtonStyle = 'alt' | 'brand';

/**
 * Properties for the Vue rendering components.
 */
export interface VTPComponentProps {
  /**
   * The content of the code to be displayed.
   */
  codeContent: string;

  /**
   * The HTML content to be displayed.
   */
  htmlContent: string;

  /**
   * Themes for light and dark modes.
   */
  themes: {
    light: BundledTheme;
    dark: BundledTheme;
  };

  /**
   * Style for the button.
   */
  buttonStyle: ButtonStyle;

  /**
   * Whether to show the preview first.
   */
  isPreviewFirst: boolean;

  /**
   * Whether to show only the preview.
   */
  isPreviewOnly: boolean;
}
