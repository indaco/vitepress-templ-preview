import * as fs from 'node:fs';
import * as path from 'node:path';
import { CSSLayerExtractor } from './css-layer-extractor';
import { hasLayerDefinition } from './css-utils';

/**
 * Class to optimize HTML styles by deduplicating and consolidating style tags.
 */
class HtmlStylesOptimizer {
  private static instance: HtmlStylesOptimizer;
  private inputDirectory: string;
  private cssLayerExtractor: CSSLayerExtractor;

  /**
   * Private constructor to prevent direct class instantiation.
   * @param {string} inputDirectory - The directory containing HTML files to optimize.
   */
  private constructor(inputDirectory: string) {
    this.inputDirectory = inputDirectory;
    this.cssLayerExtractor = CSSLayerExtractor.getInstance();
  }

  /**
   * Returns the singleton instance of HtmlStylesOptimizer.
   * @param {string} inputDirectory - The directory containing HTML files to optimize.
   * @returns {HtmlStylesOptimizer} The singleton instance.
   */
  public static getInstance(inputDirectory: string): HtmlStylesOptimizer {
    if (!HtmlStylesOptimizer.instance) {
      HtmlStylesOptimizer.instance = new HtmlStylesOptimizer(inputDirectory);
    }
    return HtmlStylesOptimizer.instance;
  }

  /**
   * Main function to optimize styles by deduplicating and consolidating style tags across multiple HTML files.
   */
  public run(): void {
    const directories = this.readDirectoriesRecursive(this.inputDirectory);

    directories.forEach((dir) => {
      const htmlFiles = this.readHtmlFiles(dir);
      if (htmlFiles.length <= 1) return;

      const { allStyleTags, fileContents, duplicateStyles } =
        this.collectStylesFromFiles(htmlFiles);

      this.processFiles(htmlFiles, allStyleTags, fileContents, duplicateStyles);
    });
  }

  /**
   * Recursively reads all directories from the specified directory.
   * @param {string} dir - The directory to read subdirectories from.
   * @returns {string[]} An array of directory paths.
   */
  private readDirectoriesRecursive(dir: string): string[] {
    let results: string[] = [dir];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(this.readDirectoriesRecursive(filePath));
      }
    });
    return results;
  }

  /**
   * Reads all HTML files from the specified directory.
   * @param {string} dir - The directory to read HTML files from.
   * @returns {string[]} An array of HTML file paths.
   */
  private readHtmlFiles(dir: string): string[] {
    return fs
      .readdirSync(dir)
      .filter((file) => path.extname(file) === '.html')
      .map((file) => path.join(dir, file));
  }

  /**
   * Collects all styles from all files and categorizes them as unique or duplicate.
   */
  private collectStylesFromFiles(htmlFiles: string[]): {
    allStyleTags: Map<string, string[]>;
    fileContents: Map<string, string>;
    duplicateStyles: Set<string>;
  } {
    const allStyleTags = new Map<string, string[]>();
    const fileContents = new Map<string, string>();
    const styleOccurrences = new Map<string, Set<string>>();

    for (const file of htmlFiles) {
      const htmlContent = fs.readFileSync(file, 'utf-8');
      const styleTags = this.extractAndProcessStyleTags(htmlContent);

      allStyleTags.set(file, styleTags);
      fileContents.set(file, htmlContent);

      // Track occurrences of styles across files (top-level and extracted styles)
      styleTags.forEach((style) => {
        if (!styleOccurrences.has(style)) {
          styleOccurrences.set(style, new Set());
        }
        styleOccurrences.get(style)!.add(file);
      });
    }

    // Identify duplicate styles
    const duplicateStyles = new Set<string>();
    styleOccurrences.forEach((files, style) => {
      if (files.size > 1) {
        duplicateStyles.add(style);
      }
    });

    return { allStyleTags, fileContents, duplicateStyles };
  }

  /**
   * Extracts and processes style tags from the given HTML content.
   */
  private extractAndProcessStyleTags(htmlContent: string): string[] {
    const styleTags = this.extractStyleTags(htmlContent);
    return styleTags.map((css) => {
      if (hasLayerDefinition(css)) {
        // Flatten the content and remove @layer declarations
        const cleanedCss = this.cssLayerExtractor.run(css);
        return cleanedCss;
      }
      return css.trim();
    });
  }

  /**
   * Extracts style tags from the given HTML content.
   * @param {string} htmlContent - The HTML content to extract style tags from.
   * @returns {string[]} An array of style tag contents.
   */
  private extractStyleTags(htmlContent: string): string[] {
    const styleTagPattern = /<style[^>]*>([\s\S]*?)<\/style>/g;
    const styleTags: string[] = [];
    let match;
    while ((match = styleTagPattern.exec(htmlContent))) {
      styleTags.push(match[1].trim()); // Extract and trim the content inside the <style> tag
    }
    return styleTags;
  }

  /**
   * Processes files by consolidating and updating styles.
   */
  private processFiles(
    htmlFiles: string[],
    allStyleTags: Map<string, string[]>,
    fileContents: Map<string, string>,
    duplicateStyles: Set<string>,
  ): void {
    let isFirstFile = true;

    for (const file of htmlFiles) {
      let htmlContent = fileContents.get(file) ?? '';

      const styleTags = allStyleTags.get(file) ?? [];
      const { uniqueStyleTags, duplicatedStyleTags } = this.splitStyleTags(
        styleTags,
        duplicateStyles,
      );

      // ** Remove style tags from content **
      htmlContent = this.removeStyleTags(htmlContent);

      // ** Add unique styles (only for the current file) **
      if (uniqueStyleTags.length > 0) {
        const uniqueStylesContent = `<style type="text/css">\n${uniqueStyleTags.join('\n')}\n</style>\n`;
        htmlContent = uniqueStylesContent + htmlContent;
      }

      // ** Add the auto-clean message if duplicates were removed **
      if (duplicatedStyleTags.length > 0 && !isFirstFile) {
        const autoCleanMessage =
          '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->\n';
        htmlContent = autoCleanMessage + htmlContent;
      }

      fs.writeFileSync(file, htmlContent);

      // ** Consolidate duplicated styles into the first file **
      if (isFirstFile) {
        this.insertUniqueStyleTags(file, duplicateStyles);
        isFirstFile = false;
      }
    }
  }

  /**
   * Removes style tags from the given HTML content.
   * @param {string} htmlContent - The HTML content to remove style tags from.
   * @returns {string} The HTML content without style tags.
   */
  private removeStyleTags(htmlContent: string): string {
    return htmlContent
      .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
      .trim()
      .replace(/^\s*$(?:\r\n?|\n)/gm, '');
  }

  /**
   * Inserts all unique style tags into the first file.
   */
  private insertUniqueStyleTags(
    filePath: string,
    styleTags: Set<string>,
  ): void {
    if (styleTags.size === 0) return;

    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    const newStyleContent = `<style type="text/css">\n${Array.from(styleTags).join('\n')}\n</style>\n`;
    const autoCleanMessage =
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - All styles are consolidated here to avoid duplication -->\n';
    const newHtmlContent = autoCleanMessage + newStyleContent + htmlContent;
    fs.writeFileSync(filePath, newHtmlContent);
  }

  /**
   * Splits style tags into two categories:
   * 1. Unique styles that remain in the file.
   * 2. Duplicated styles that will be removed from the file.
   */
  private splitStyleTags(
    styleTags: string[],
    duplicateStyles: Set<string>,
  ): { uniqueStyleTags: string[]; duplicatedStyleTags: string[] } {
    const uniqueStyleTags = styleTags.filter(
      (tag) => !duplicateStyles.has(tag),
    );
    const duplicatedStyleTags = styleTags.filter((tag) =>
      duplicateStyles.has(tag),
    );

    return { uniqueStyleTags, duplicatedStyleTags };
  }
}

export default HtmlStylesOptimizer;
