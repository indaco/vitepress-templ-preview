import MarkdownIt from "markdown-it";
import { BundledTheme } from "shiki";

/**
 * Interface representing the options for the vite-templ-preview plugin.
 */
export interface PluginOptions {
  /**
   * The root folder for the templ project.
   * This is the base directory where your templ project is located.
   * @default "templ-preview"
   */
  projectDir?: string;

  /**
   * The input folder where the templ components are.
   * This is the directory relative to the projectDir where your .templ files are located.
   * @default "demos"
   */
  inputDir?: string;

  /**
   * The output folder where the HTML files will be generated.
   * This is the directory relative to the projectDir where the generated HTML files will be placed.
   * @default "output"
   */
  outputDir?: string;

  /**
   * Whether or not to keep the static-templ generation script after completion.
   * @default false
   */
  debug?: boolean;
}

export interface PluginContext {
  md: MarkdownIt;
  serverRoot: string;
  finalOptions: PluginOptions;
  fileCache: Record<string, CachedFile>;
  watchedMdFiles: Record<string, Set<string>>;
}

export interface CachedFile {
  content: string;
}

export interface TagAttrs {
  [key: string]: string;
}

export type ButtonStyle = "alt" | "brand";

export interface VTPComponentProps {
  codeContent: string;
  htmlContent: string;
  themes: {
    light: BundledTheme;
    dark: BundledTheme;
  };
  buttonStyle: ButtonStyle;
  isPreviewFirst: boolean;
}
