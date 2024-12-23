import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Class to optimize HTML scripts by deduplicating and consolidating script tags.
 */
class HtmlScriptsOptimizer {
  private static instance: HtmlScriptsOptimizer;

  /** Message inserted for consolidated scripts in the first file. */
  private static readonly CONSOLIDATED_SCRIPTS_MSG =
    '<!-- [vitepress-templ-plugin] - DO NOT EDIT - All scripts are consolidated here to avoid duplication -->\n';

  /** Message inserted for files where duplicated scripts were removed. */
  private static readonly DUPLICATED_SCRIPTS_FOUND_MSG =
    '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated scripts found and moved to avoid duplication -->\n';

  /** Regex to match <script> tags in HTML. */
  private static readonly SCRIPT_TAG_REGEX =
    /<script[^>]*>([\s\S]*?)<\/script>/g;

  /** Directory containing HTML files to optimize. */
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
   * @returns {HtmlScriptsOptimizer} - The singleton instance.
   */
  public static getInstance(inputDirectory: string): HtmlScriptsOptimizer {
    if (!HtmlScriptsOptimizer.instance) {
      HtmlScriptsOptimizer.instance = new HtmlScriptsOptimizer(inputDirectory);
    }
    return HtmlScriptsOptimizer.instance;
  }

  /**
   * Main function to optimize scripts by deduplicating and consolidating script tags across multiple HTML files.
   */
  public run(): void {
    const directories = this.readDirectoriesRecursive(this.inputDirectory);

    directories.forEach((dir) => {
      const htmlFiles = this.readHtmlFiles(dir);
      if (htmlFiles.length <= 1) return;

      const { allScriptTags, fileContents } =
        this.collectScriptsFromFiles(htmlFiles);

      this.processFiles(htmlFiles, fileContents, allScriptTags);
    });
  }

  /**
   * Collects all script tags and file contents from the specified HTML files.
   * @param {string[]} htmlFiles - Array of HTML file paths to process.
   * @returns {object} - An object containing all script tags and file contents.
   */
  private collectScriptsFromFiles(htmlFiles: string[]): {
    allScriptTags: Set<string>;
    fileContents: Map<string, string>;
  } {
    const allScriptTags = new Set<string>();
    const fileContents = new Map<string, string>();

    htmlFiles.forEach((file) => {
      const htmlContent = fs.readFileSync(file, 'utf-8');
      fileContents.set(file, htmlContent);

      const scriptTags = this.extractScriptTags(htmlContent);
      scriptTags.forEach((tag) => allScriptTags.add(tag));
    });

    return { allScriptTags, fileContents };
  }

  /**
   * Processes the HTML files to remove and consolidate script tags.
   * @param {string[]} htmlFiles - Array of HTML file paths to process.
   * @param {Map<string, string>} fileContents - Mapping of file paths to their HTML contents.
   * @param {Set<string>} allScriptTags - Set of all script tag contents across files.
   */
  private processFiles(
    htmlFiles: string[],
    fileContents: Map<string, string>,
    allScriptTags: Set<string>,
  ): void {
    let isFirstFile = true;

    htmlFiles.forEach((file) => {
      let htmlContent = fileContents.get(file) || '';
      const scriptTagsInFile = this.extractScriptTags(htmlContent);

      htmlContent = this.removeScriptTags(htmlContent);

      if (!isFirstFile && scriptTagsInFile.length > 0) {
        htmlContent =
          HtmlScriptsOptimizer.DUPLICATED_SCRIPTS_FOUND_MSG + htmlContent;
      }

      fs.writeFileSync(file, htmlContent);

      if (isFirstFile) {
        this.insertAllScriptTags(file, Array.from(allScriptTags));
        isFirstFile = false;
      }
    });
  }

  /**
   * Extracts script tags from the given HTML content.
   * @param {string} htmlContent - The HTML content to extract script tags from.
   * @returns {string[]} - An array of script tag contents.
   */
  private extractScriptTags(htmlContent: string): string[] {
    return Array.from(
      htmlContent.matchAll(HtmlScriptsOptimizer.SCRIPT_TAG_REGEX),
      (m) => m[1].trim(),
    );
  }

  /**
   * Removes all script tags from the given HTML content.
   * @param {string} htmlContent - The HTML content to process.
   * @returns {string} - The HTML content without script tags.
   */
  private removeScriptTags(htmlContent: string): string {
    return htmlContent
      .replace(HtmlScriptsOptimizer.SCRIPT_TAG_REGEX, '')
      .trim()
      .replace(/^\s*$(?:\r\n?|\n)/gm, '');
  }

  /**
   * Inserts all consolidated script tags into the specified HTML file.
   * @param {string} filePath - The path to the HTML file.
   * @param {string[]} scriptTags - Array of script tag contents to insert.
   */
  private insertAllScriptTags(filePath: string, scriptTags: string[]): void {
    if (scriptTags.length === 0) return;

    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    const newScriptContent = `<script type="text/javascript">\n${scriptTags.join(
      '\n',
    )}\n</script>\n`;

    const updatedContent =
      HtmlScriptsOptimizer.CONSOLIDATED_SCRIPTS_MSG +
      newScriptContent +
      htmlContent;

    fs.writeFileSync(filePath, updatedContent);
  }

  /**
   * Recursively reads all directories from the specified directory.
   * @param {string} dir - The directory to read subdirectories from.
   * @returns {string[]} - An array of directory paths.
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
   * @returns {string[]} - An array of HTML file paths.
   */
  private readHtmlFiles(dir: string): string[] {
    return fs
      .readdirSync(dir)
      .filter((file) => path.extname(file) === '.html')
      .map((file) => path.join(dir, file));
  }
}

export default HtmlScriptsOptimizer;
