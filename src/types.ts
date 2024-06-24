import MarkdownIt from "markdown-it";
import type { ThemeOptions } from "vitepress";

export interface PluginOptions {
  projectDir?: string;
  templDir?: string;
  outputDir?: string;
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
  title: string;
  codeContent: string;
  htmlContent: string;
  themes: ThemeOptions;
  buttonStyle: ButtonStyle;
}
