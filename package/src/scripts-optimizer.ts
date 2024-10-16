import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Class to optimize HTML scripts by deduplicating and consolidating script tags.
 */
class HtmlScriptsOptimizer {
  private static instance: HtmlScriptsOptimizer;
  private inputDirectory: string;

  /**
   * Private constructor to prevent direct class instantiation.
   * @param {string} inputDirectory - The directory containing HTML files to optimize.
   */
  private constructor(inputDirectory: string) {
    this.inputDirectory = inputDirectory;
  }

  /**
   * Returns the singleton instance of HtmlScriptsOptimizer.
   * @param {string} inputDirectory - The directory containing HTML files to optimize.
   * @returns {HtmlScriptsOptimizer} The singleton instance.
   */
  public static getInstance(inputDirectory: string): HtmlScriptsOptimizer {
    if (!HtmlScriptsOptimizer.instance) {
      HtmlScriptsOptimizer.instance = new HtmlScriptsOptimizer(inputDirectory);
    }
    return HtmlScriptsOptimizer.instance;
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
   * Extracts script tags from the given HTML content.
   * @param {string} htmlContent - The HTML content to extract script tags from.
   * @returns {string[]} An array of script tag contents.
   */
  private extractScriptTags(htmlContent: string): string[] {
    const scriptTagPattern = /<script[^>]*>([\s\S]*?)<\/script>/g;
    const scriptTags: string[] = [];
    let match;
    while ((match = scriptTagPattern.exec(htmlContent))) {
      scriptTags.push(match[1].trim()); // Extract and trim the content inside the <script> tag
    }
    return scriptTags;
  }

  /**
   * Removes script tags from the given HTML content.
   * @param {string} htmlContent - The HTML content to remove script tags from.
   * @returns {string} The HTML content without script tags.
   */
  private removeScriptTags(htmlContent: string): string {
    return htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/g, '')
      .trim()
      .replace(/^\s*$(?:\r\n?|\n)/gm, ''); // Clean up empty lines
  }

  /**
   * Inserts all script tags into the first HTML file, including both unique and duplicate tags.
   * @param {string} filePath - The path to the first HTML file to insert script tags into.
   * @param {Set<string>} scriptTags - The set of all script tag contents to insert.
   */
  private insertAllScriptTags(filePath: string, scriptTags: Set<string>): void {
    if (scriptTags.size === 0) return; // Avoid inserting if there are no script tags

    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    const newScriptContent = `<script type="text/javascript">\n${Array.from(
      scriptTags,
    ).join('\n')}\n</script>\n`;
    const autoCleanMessage =
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - All scripts are consolidated here to avoid duplication -->\n';
    const newHtmlContent =
      htmlContent + '\n' + autoCleanMessage + newScriptContent;
    fs.writeFileSync(filePath, newHtmlContent); // Write updated content with scripts
  }

  /**
   * Adds the auto-clean message to files where script tags were removed.
   * @param {string} filePath - The path to the HTML file to add the auto-clean message to.
   */
  private addAutoCleanMessage(filePath: string): void {
    const autoCleanMessage =
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated scripts found and moved to avoid duplication -->\n';
    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    const newHtmlContent = autoCleanMessage + htmlContent;
    fs.writeFileSync(filePath, newHtmlContent);
  }

  /**
   * Main function to optimize scripts by deduplicating and consolidating script tags across multiple HTML files.
   * All script tags (both unique and duplicate) are moved to the first file.
   */
  public run(): void {
    const directories = this.readDirectoriesRecursive(this.inputDirectory);

    directories.forEach((dir) => {
      const htmlFiles = this.readHtmlFiles(dir);
      if (htmlFiles.length <= 1) {
        return;
      }

      const allScriptTags = new Set<string>(); // A set to hold all script tags across files

      // Extract script tags from all HTML files and store them in a set
      for (const file of htmlFiles) {
        const htmlContent = fs.readFileSync(file, 'utf-8');
        const scriptTags = this.extractScriptTags(htmlContent);
        scriptTags.forEach((tag) => allScriptTags.add(tag));
      }

      // Process each file: remove all script tags from every file except the first one
      let isFirstFile = true;
      for (const file of htmlFiles) {
        let htmlContent = fs.readFileSync(file, 'utf-8');
        const scriptTagsInFile = this.extractScriptTags(htmlContent);

        // Remove all original script tags
        htmlContent = this.removeScriptTags(htmlContent);

        // If script tags were removed from the file and it's not the first file, add the auto-clean message
        if (scriptTagsInFile.length > 0 && !isFirstFile) {
          htmlContent =
            '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated scripts found and moved to avoid duplication -->\n' +
            htmlContent;
        }

        // Write back the cleaned-up content for all files (without script tags for non-first files)
        fs.writeFileSync(file, htmlContent);

        // For the first file, insert all the unique and duplicate script tags at the end of the file
        if (isFirstFile) {
          this.insertAllScriptTags(file, allScriptTags);
          isFirstFile = false; // Mark the first file as processed
        }
      }
    });
  }
}

export default HtmlScriptsOptimizer;
