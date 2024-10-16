import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Class to optimize HTML styles by deduplicating and consolidating style tags.
 */
class HtmlStylesOptimizer {
  private static instance: HtmlStylesOptimizer;
  private inputDirectory: string;

  /**
   * Private constructor to prevent direct class instantiation.
   * @param {string} inputDirectory - The directory containing HTML files to optimize.
   */
  private constructor(inputDirectory: string) {
    this.inputDirectory = inputDirectory;
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
   * Inserts unique style tags wrapped in a single <style> tag at the top of the specified HTML file.
   * @param {string} filePath - The path to the HTML file to insert style tags into.
   * @param {Set<string>} styleTags - The set of unique style tag contents to insert.
   */
  private insertUniqueStyleTags(
    filePath: string,
    styleTags: Set<string>,
  ): void {
    if (styleTags.size === 0) return; // Avoid inserting if there are no style tags

    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    const newStyleContent = `<style type="text/css">\n${Array.from(
      styleTags,
    ).join('\n')}\n</style>\n`;
    const autoCleanMessage =
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - All styles are consolidated here to avoid duplication -->\n';
    const newHtmlContent = autoCleanMessage + newStyleContent + htmlContent;
    fs.writeFileSync(filePath, newHtmlContent);
  }

  /**
   * Main function to optimize styles by deduplicating and consolidating style tags across multiple HTML files.
   */
  public run(): void {
    const directories = this.readDirectoriesRecursive(this.inputDirectory);

    directories.forEach((dir) => {
      const htmlFiles = this.readHtmlFiles(dir);
      if (htmlFiles.length <= 1) {
        return;
      }

      const allStyleTags = new Map<string, string[]>();
      const uniqueStyleTags = new Set<string>();
      const duplicateStyleTags = new Set<string>();

      // Extract style tags from all HTML files and categorize them
      for (const file of htmlFiles) {
        const htmlContent = fs.readFileSync(file, 'utf-8');
        const styleTags = this.extractStyleTags(htmlContent);
        allStyleTags.set(file, styleTags);

        // Identify duplicate style tags
        styleTags.forEach((tag) => {
          if (uniqueStyleTags.has(tag)) {
            duplicateStyleTags.add(tag);
          } else {
            uniqueStyleTags.add(tag);
          }
        });
      }

      // Process each file and update styles
      let isFirstFile = true;
      for (const file of htmlFiles) {
        let htmlContent = fs.readFileSync(file, 'utf-8');
        const styleTags = allStyleTags.get(file) || [];
        const remainingStyleTags = styleTags.filter(
          (tag) => !duplicateStyleTags.has(tag),
        );

        // Remove all original style tags and trim content
        htmlContent = this.removeStyleTags(htmlContent);

        // Add remaining (non-duplicate) style tags back to the file if any exist
        if (remainingStyleTags.length > 0) {
          const remainingStyleContent = `<style type="text/css">\n${remainingStyleTags.join(
            '\n',
          )}\n</style>\n`;
          htmlContent = remainingStyleContent + htmlContent;
        }

        // Add the auto-clean message if duplicate styles were removed and it's not the first file
        if (styleTags.length > remainingStyleTags.length && !isFirstFile) {
          const autoCleanMessage =
            '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->\n';
          htmlContent = autoCleanMessage + htmlContent;
        }

        fs.writeFileSync(file, htmlContent);

        if (isFirstFile) {
          // Insert unique styles in the first file
          this.insertUniqueStyleTags(file, duplicateStyleTags);
          isFirstFile = false;
        }
      }
    });
  }
}

export default HtmlStylesOptimizer;
