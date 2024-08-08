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
      .replace(/^\s*$(?:\r\n?|\n)/gm, '');
  }

  /**
   * Inserts unique script tags wrapped in a single <script> tag at the top of the specified HTML file.
   * @param {string} filePath - The path to the HTML file to insert script tags into.
   * @param {Set<string>} scriptTags - The set of unique script tag contents to insert.
   */
  private insertUniqueScriptTags(
    filePath: string,
    scriptTags: Set<string>,
  ): void {
    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    const newScriptContent = `<script type="text/javascript">\n${Array.from(scriptTags).join('\n')}\n</script>\n`;
    const autoCleanMessage =
      '<!-- [vitepress-templ-plugin] - DO NOT EDIT - All scripts are consolidated here to avoid duplication -->\n';
    const newHtmlContent = autoCleanMessage + newScriptContent + htmlContent;
    fs.writeFileSync(filePath, newHtmlContent);
  }

  /**
   * Main function to optimize scripts by deduplicating and consolidating script tags across multiple HTML files.
   */
  public run(): void {
    const directories = this.readDirectoriesRecursive(this.inputDirectory);

    directories.forEach((dir) => {
      const htmlFiles = this.readHtmlFiles(dir);
      if (htmlFiles.length <= 1) {
        return;
      }

      const allScriptTags = new Map<string, string[]>();
      const uniqueScriptTags = new Set<string>();
      const duplicateScriptTags = new Set<string>();

      // Extract script tags from all HTML files and categorize them
      for (const file of htmlFiles) {
        const htmlContent = fs.readFileSync(file, 'utf-8');
        const scriptTags = this.extractScriptTags(htmlContent);
        allScriptTags.set(file, scriptTags);

        // Identify duplicate script tags
        scriptTags.forEach((tag) => {
          if (uniqueScriptTags.has(tag)) {
            duplicateScriptTags.add(tag);
          } else {
            uniqueScriptTags.add(tag);
          }
        });
      }

      // Process each file and update scripts
      let isFirstFile = true;
      for (const file of htmlFiles) {
        let htmlContent = fs.readFileSync(file, 'utf-8');
        const scriptTags = allScriptTags.get(file) || [];
        const remainingScriptTags = scriptTags.filter(
          (tag) => !duplicateScriptTags.has(tag),
        );

        // Remove all original script tags and trim content
        htmlContent = this.removeScriptTags(htmlContent);

        // Add remaining (non-duplicate) script tags back to the file
        if (remainingScriptTags.length > 0) {
          const remainingScriptContent = `<script type="text/javascript">\n${remainingScriptTags.join('\n')}\n</script>\n`;
          htmlContent = remainingScriptContent + htmlContent;
        }

        // Add the auto-clean message if duplicate scripts were removed and it's not the first file
        if (scriptTags.length > remainingScriptTags.length && !isFirstFile) {
          const autoCleanMessage =
            '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated scripts found and moved to avoid duplication -->\n';
          htmlContent = autoCleanMessage + htmlContent;
        }

        fs.writeFileSync(file, htmlContent);

        if (isFirstFile) {
          // Insert unique scripts in the first file
          this.insertUniqueScriptTags(file, duplicateScriptTags);
          isFirstFile = false;
        }
      }
    });
  }
}

export default HtmlScriptsOptimizer;
