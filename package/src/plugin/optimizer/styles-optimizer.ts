import * as fs from 'node:fs';
import * as path from 'node:path';
import { CssRuleAnalyzer } from '../css-processor/rule-analyzer';
import {
  CssTokenProcessor,
  DEFAULT_TOKEN_PROCESSOR_OPTIONS,
} from '../css-processor/css-token-processor';
import { CssTokenizer } from '../css-processor/css-tokenizer';
import { LayerProcessor } from '../css-processor/strategies/layer-processor';
import { TokenProcessorStrategyOptions } from '../css-processor/strategies/token-processor-strategy';
import { HtmlTagOptimizer } from './optimizer';

/**
 * Class to optimize HTML styles by deduplicating and consolidating styles tags.
 */
class HtmlStylesOptimizer implements HtmlTagOptimizer {
  /** Singleton instance of the HtmlStylesOptimizer class.*/
  private static instance: HtmlStylesOptimizer;

  /** Message inserted for consolidated styles in the first file. */
  private static readonly CONSOLIDATED_STYLES_MSG =
    '<!-- [vitepress-templ-plugin] - DO NOT EDIT - All styles are consolidated here to avoid duplication -->\n';

  /** Message inserted for files where duplicated styles were removed. */
  private static readonly DUPLICATED_STYLES_FOUND_MSG =
    '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->\n';

  /** Regex to match <style> tags in HTML. */
  private static readonly STYLE_TAG_REGEX = /<style[^>]*>([\s\S]*?)<\/style>/g;

  /**
   * Default options for the Token Processor Strategy.
   */
  private static readonly DEFAULT_OPTIONS: Required<TokenProcessorStrategyOptions> =
    {
      ...DEFAULT_TOKEN_PROCESSOR_OPTIONS,
      extractFromLayers: true,
      minify: true,
    };

  /** Directory containing HTML files to optimize. */
  private inputDirectory: string;

  /** Instance of CssTokenProcessor to process and extract CSS layer contents. */
  private cssProcessor: CssTokenProcessor;

  /** Instance of CssRuleAnalyzer to analyze and process CSS rules. */
  private cssRuleAnalyzer: CssRuleAnalyzer;

  /** Options for the Token Processor Strategy. */
  private options: Required<TokenProcessorStrategyOptions>;

  /**
   * Private constructor to initialize with the input directory and options.
   * @param {string} inputDirectory - The directory containing HTML files to optimize.
   * @param {TokenProcessorStrategyOptions} [options] - Options for the CSS processor.
   */
  private constructor(
    inputDirectory: string,
    options: TokenProcessorStrategyOptions = {},
  ) {
    this.inputDirectory = inputDirectory;
    this.options = this.mergeOptions(options);

    this.cssProcessor = new CssTokenProcessor(
      [new LayerProcessor()],
      this.options,
    );
    this.cssRuleAnalyzer = new CssRuleAnalyzer(this.cssProcessor, this.options);
  }

  /**
   * Sets the options for the LayerProcessor.
   *
   * @param {TokenProcessorStrategyOptions} options - Options to update.
   */
  setOptions(options: TokenProcessorStrategyOptions): void {
    this.options = this.mergeOptions(options);
  }

  /**
   * Gets the singleton instance of HtmlStylesOptimizer.
   * @param {string} inputDirectory - The directory containing HTML files to optimize.
   * @param {TokenProcessorStrategyOptions} [options] - Options for the CSS processor.
   * @returns {HtmlStylesOptimizer} - The singleton instance.
   */
  public static getInstance(
    inputDirectory: string,
    options?: TokenProcessorStrategyOptions,
  ): HtmlStylesOptimizer {
    if (!HtmlStylesOptimizer.instance) {
      HtmlStylesOptimizer.instance = new HtmlStylesOptimizer(
        inputDirectory,
        options,
      );
    } else if (options) {
      // Update the instance with new options if already initialized
      HtmlStylesOptimizer.instance.updateOptions(options);
    }
    return HtmlStylesOptimizer.instance;
  }

  /**
   * Updates the options for the optimizer.
   * @param {TokenProcessorStrategyOptions} options - New options to update.
   */
  public updateOptions(options: TokenProcessorStrategyOptions): void {
    this.mergeOptions(options);
    this.cssProcessor.setOptions(this.options);
    this.cssRuleAnalyzer.setOptions(this.options);
  }

  /**
   * Main entry point to optimize styles in all relevant HTML files.
   */
  public run(): void {
    const directories = this.readDirectoriesRecursive(this.inputDirectory);

    directories.forEach((dir) => {
      const htmlFiles = this.readHtmlFiles(dir);
      if (htmlFiles.length <= 1) return;

      // Collect styles and consolidate using CssRuleAnalyzer
      const { consolidatedStyles, uniqueStyles } =
        this.consolidateStylesAcrossFiles(htmlFiles);

      // Update the HTML files with the optimized styles
      this.updateHtmlFiles(htmlFiles, consolidatedStyles, uniqueStyles);
    });
  }

  /**
   * Consolidates styles across HTML files.
   * @param {string[]} htmlFiles - Array of HTML file paths.
   * @returns {{
   *   consolidatedStyles: Map<string, string[]>;
   *   uniqueStyles: Map<string, string[]>;
   * }} - Consolidated and unique styles.
   */
  private consolidateStylesAcrossFiles(htmlFiles: string[]): {
    consolidatedStyles: Map<string, string[]>;
    uniqueStyles: Map<string, string[]>;
  } {
    // Step 1: Load all file contents
    const fileContents = this.loadFileContents(htmlFiles);

    // Step 2: Extract and normalize all CSS blocks
    const { rawCssBlocksByFile, cssInputs, ruleToFileMap, inputToFileMap } =
      this.extractAndNormalizeCssBlocks(htmlFiles, fileContents);

    // Step 3: Analyze CSS rules
    const analysisResult = this.cssRuleAnalyzer.analyze(cssInputs);

    // Step 4: Consolidate duplicate styles
    const consolidatedStyles = this.getConsolidatedStyles(
      analysisResult.duplicates,
      ruleToFileMap,
    );

    // Step 5: Assign unique styles per file
    const uniqueStyles = this.getUniqueStyles(
      htmlFiles,
      rawCssBlocksByFile,
      analysisResult.unique,
      inputToFileMap,
    );

    return { consolidatedStyles, uniqueStyles };
  }

  /**
   * Loads the content of HTML files.
   * @param {string[]} htmlFiles - Array of HTML file paths.
   * @returns {Map<string, string>} - Map of file paths to their content.
   */
  private loadFileContents(htmlFiles: string[]): Map<string, string> {
    return new Map(
      htmlFiles.map((file) => [file, fs.readFileSync(file, 'utf-8')]),
    );
  }

  /**
   * Extracts and normalizes CSS blocks from HTML files.
   * @param {string[]} htmlFiles - Array of HTML file paths.
   * @param {Map<string, string>} fileContents - Map of file paths to their content.
   * @returns {{
   *   rawCssBlocksByFile: Map<string, Set<string>>;
   *   cssInputs: string[];
   *   ruleToFileMap: Map<string, string>;
   *   inputToFileMap: Map<string, string>;
   * }} - Data structures for CSS extraction and mapping.
   */
  private extractAndNormalizeCssBlocks(
    htmlFiles: string[],
    fileContents: Map<string, string>,
  ): {
    rawCssBlocksByFile: Map<string, Set<string>>;
    cssInputs: string[];
    ruleToFileMap: Map<string, string>;
    inputToFileMap: Map<string, string>;
  } {
    const rawCssBlocksByFile = new Map<string, Set<string>>();
    const cssInputs: string[] = [];
    const ruleToFileMap = new Map<string, string>(); // Track the first file where a rule appears
    const inputToFileMap = new Map<string, string>(); // Map Input #n to file path

    htmlFiles.forEach((file) => {
      const rawCssBlocks = new Set<string>();
      const fileContent = fileContents.get(file);

      if (fileContent) {
        const styleBlocks = this.extractStyleTags(fileContent);

        styleBlocks.forEach((block) => {
          // Tokenize and process the CSS block
          const tokens = new CssTokenizer().tokenize(block);
          const processedTokens = this.cssProcessor.execute(
            tokens,
            this.options,
          );

          // Use the CssTokenProcessor's `serialize` method to reconstruct valid CSS rules
          const normalizedRules =
            this.cssRuleAnalyzer.minifyRules(processedTokens);

          normalizedRules.forEach((rule) => {
            const completeRule = rule; // Ensure proper CSS syntax
            rawCssBlocks.add(completeRule);

            const inputId = `Input #${cssInputs.length + 1}`;
            cssInputs.push(`/* Source: ${file} */\n${completeRule}`);
            inputToFileMap.set(inputId, file);
            if (!ruleToFileMap.has(completeRule)) {
              ruleToFileMap.set(completeRule, file);
            }
          });
        });
      }

      rawCssBlocksByFile.set(file, rawCssBlocks);
    });

    return { rawCssBlocksByFile, cssInputs, ruleToFileMap, inputToFileMap };
  }

  /**
   * Computes consolidated styles for duplicate rules.
   * @param {Map<string, { rule: string; sources: string[] }>} duplicates - Duplicate rules.
   * @param {Map<string, string>} ruleToFileMap - Mapping of rules to their first file.
   * @returns {Map<string, string[]>} - Map of file paths to consolidated styles.
   */
  private getConsolidatedStyles(
    duplicates: Map<string, { rule: string; sources: string[] }>,
    ruleToFileMap: Map<string, string>,
  ): Map<string, string[]> {
    const consolidatedStyles = new Map<string, string[]>();

    duplicates.forEach((entry) => {
      const file = ruleToFileMap.get(entry.rule);
      if (!file) return;

      if (!consolidatedStyles.has(file)) {
        consolidatedStyles.set(file, []);
      }
      consolidatedStyles.get(file)!.push(entry.rule);
    });

    return consolidatedStyles;
  }

  /**
   * Computes unique styles for each file.
   * @param {string[]} htmlFiles - Array of HTML file paths.
   * @param {Map<string, Set<string>>} rawCssBlocksByFile - Map of file paths to raw CSS blocks.
   * @param {Map<string, { rule: string; sources: string[] }>} uniqueEntries - Unique rules.
   * @param {Map<string, string>} inputToFileMap - Mapping of input identifiers to file paths.
   * @returns {Map<string, string[]>} - Map of file paths to unique styles.
   */
  private getUniqueStyles(
    htmlFiles: string[],
    rawCssBlocksByFile: Map<string, Set<string>>,
    uniqueEntries: Map<string, { rule: string; sources: string[] }>,
    inputToFileMap: Map<string, string>,
  ): Map<string, string[]> {
    const uniqueStyles = new Map<string, string[]>();

    htmlFiles.forEach((file) => {
      const rawStyles = rawCssBlocksByFile.get(file) || new Set();

      // Filter unique rules for this file
      const fileUniqueStyles: string[] = Array.from(rawStyles).filter((rule) =>
        Array.from(uniqueEntries.values()).some((uniqueEntry) => {
          const isSourceMatch = uniqueEntry.sources.some((source) => {
            const mappedFile = inputToFileMap.get(source);
            return mappedFile === file; // Match source to the current file
          });
          const isRuleMatch = uniqueEntry.rule.trim() === rule.trim(); // Match rule exactly
          return isSourceMatch && isRuleMatch;
        }),
      );

      uniqueStyles.set(file, fileUniqueStyles);
    });

    return uniqueStyles;
  }

  /**
   * Updates HTML files with consolidated and unique styles.
   * @param {string[]} htmlFiles - Array of HTML file paths.
   * @param {string[]} consolidatedStyles - Consolidated duplicate CSS rules.
   * @param {Map<string, string[]>} uniqueStyles - Map of unique styles for each file.
   */
  private updateHtmlFiles(
    htmlFiles: string[],
    consolidatedStyles: Map<string, string[]>,
    uniqueStyles: Map<string, string[]>,
  ): void {
    htmlFiles.forEach((file, index) => {
      const fileUniqueStyles = uniqueStyles.get(file) || [];
      const fileConsolidatedStyles = consolidatedStyles.get(file) || [];
      const htmlContent = fs.readFileSync(file, 'utf-8');
      const htmlWithoutStyleTags = this.removeStyleTags(htmlContent);

      let stylesToInject = '';
      let message = '';

      if (index === 0) {
        // First file gets all consolidated styles and its unique styles
        stylesToInject = this.wrapWithStyleTag([
          ...fileUniqueStyles,
          ...fileConsolidatedStyles,
        ]);
        message = HtmlStylesOptimizer.CONSOLIDATED_STYLES_MSG;
      } else {
        // Other files get only their specific consolidated and unique styles
        stylesToInject = this.wrapWithStyleTag([
          ...fileConsolidatedStyles,
          ...fileUniqueStyles,
        ]);
        message = HtmlStylesOptimizer.DUPLICATED_STYLES_FOUND_MSG;
      }

      const updatedContent =
        message + stylesToInject + htmlWithoutStyleTags.trim();

      fs.writeFileSync(file, updatedContent);
    });
  }

  /**
   * Extracts style tags from the given HTML content.
   * @param {string} htmlContent - The HTML content to extract style tags from.
   * @returns {string[]} An array of style tag contents.
   */
  private extractStyleTags(htmlContent: string): string[] {
    return Array.from(
      htmlContent.matchAll(HtmlStylesOptimizer.STYLE_TAG_REGEX),
      (m) => m[1].trim(),
    );
  }

  /**
   * Wraps a list of styles into a <style> block.
   * @param {string[]} styles - List of serialized CSS rules.
   * @returns {string} - The resulting <style> block.
   */
  private wrapWithStyleTag(styles: string[]): string {
    if (!styles.length) return '';
    return `<style type="text/css">\n${styles.join('\n')}\n</style>\n`;
  }

  /**
   * Removes all <style> tags from the given HTML content.
   * @param {string} htmlContent - The HTML content to process.
   * @returns {string} - The HTML content without <style> tags.
   */
  private removeStyleTags(htmlContent: string): string {
    return htmlContent
      .replace(HtmlStylesOptimizer.STYLE_TAG_REGEX, '')
      .trim()
      .replace(/^\s*$(?:\r\n?|\n)/gm, '');
  }

  /**
   * Recursively reads all subdirectories from the specified directory.
   * @param {string} dir - The directory to read.
   * @returns {string[]} - Array of all directories including the root directory.
   */
  private readDirectoriesRecursive(dir: string): string[] {
    const stack = [dir];
    const results: string[] = [];

    while (stack.length) {
      const currentDir = stack.pop()!;
      results.push(currentDir);

      const entries = fs.readdirSync(currentDir);
      entries.forEach((entry) => {
        const entryPath = path.join(currentDir, entry);
        if (fs.statSync(entryPath).isDirectory()) {
          stack.push(entryPath);
        }
      });
    }

    return results;
  }

  /**
   * Reads all HTML files from the specified directory.
   * @param {string} dir - The directory to scan for HTML files.
   * @returns {string[]} - Array of file paths to HTML files.
   */
  private readHtmlFiles(dir: string): string[] {
    return fs
      .readdirSync(dir)
      .filter((file) => path.extname(file) === '.html')
      .map((file) => path.join(dir, file));
  }

  /**
   * Merges provided options with defaults.
   *
   * @param {TokenProcessorStrategyOptions} [options] - Options to merge with defaults.
   * @returns {Required<TokenProcessorStrategyOptions>} - The merged options.
   */
  private mergeOptions(
    options?: TokenProcessorStrategyOptions,
  ): Required<TokenProcessorStrategyOptions> {
    return {
      ...HtmlStylesOptimizer.DEFAULT_OPTIONS,
      ...options,
    };
  }
}

export default HtmlStylesOptimizer;
