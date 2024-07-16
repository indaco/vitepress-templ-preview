import MarkdownIt from 'markdown-it';
import { BundledTheme } from 'shiki';

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
}

export type VTPUserConfig = Partial<PluginConfig>;

export interface PluginContext {
  md: MarkdownIt;
  serverRoot: string;
  pluginOptions: Partial<PluginConfig>;
  fileCache: Record<string, CachedFile>;
  watchedMdFiles: Record<string, Set<string>>;
  theme: { light: BundledTheme; dark: BundledTheme };
}

export interface CachedFile {
  content: string;
}

export interface TagAttrs {
  [key: string]: string;
}

export type ButtonStyle = 'alt' | 'brand';

export interface VTPComponentProps {
  codeContent: string;
  htmlContent: string;
  themes: {
    light: BundledTheme;
    dark: BundledTheme;
  };
  buttonStyle: ButtonStyle;
  isPreviewFirst: boolean;
  isPreviewOnly: boolean;
}

export interface CodeExtractorOptions {
  goExportedOnly?: boolean;
  goPackage?: boolean;
  goImports?: boolean;
  goVars?: boolean;
  goConsts?: boolean;
  goTypes?: boolean;
}

export type UserMessage = {
  headline: string;
  message: string;
};
