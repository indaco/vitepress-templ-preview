import * as fs from 'node:fs';
import * as path from 'node:path';
import { CssAstParser, Rule, AtRule } from './css-ast-parser';

/**
 * Class to optimize HTML styles by deduplicating and consolidating styles tags.
 */
class HtmlStylesOptimizer {
  private static instance: HtmlStylesOptimizer;

  /** Message inserted for consolidated styles in the first file. */
  private static readonly CONSOLIDATED_STYLES_MSG =
    '<!-- [vitepress-templ-plugin] - DO NOT EDIT - All styles are consolidated here to avoid duplication -->\n';

  /** Message inserted for files where duplicated styles were removed. */
  private static readonly DUPLICATED_STYLES_FOUND_MSG =
    '<!-- [vitepress-templ-plugin] - DO NOT EDIT - Duplicated styles found and moved to avoid duplication -->\n';

  /** Regex to match <style> tags in HTML. */
  private static readonly STYLE_TAG_REGEX = /<style[^>]*>([\s\S]*?)<\/style>/g;

  /** Directory containing HTML files to optimize. */
  private inputDirectory: string;

  /**
   * Private constructor to initialize with the input directory.
   * @param {string} inputDirectory - The directory containing HTML files to optimize.
   */
  private constructor(inputDirectory: string) {
    this.inputDirectory = inputDirectory;
  }

  /**
   * Gets the singleton instance of HtmlStylesOptimizer.
   * @param {string} inputDirectory - The directory containing HTML files to optimize.
   * @returns {HtmlStylesOptimizer} - The singleton instance.
   */
  public static getInstance(inputDirectory: string): HtmlStylesOptimizer {
    if (!HtmlStylesOptimizer.instance) {
      HtmlStylesOptimizer.instance = new HtmlStylesOptimizer(inputDirectory);
    }
    return HtmlStylesOptimizer.instance;
  }

  /**
   * Main entry point to optimize styles in all relevant HTML files.
   */
  public run(): void {
    const directories = this.readDirectoriesRecursive(this.inputDirectory);
    directories.forEach((dir) => {
      const htmlFiles = this.readHtmlFiles(dir);
      if (htmlFiles.length <= 1) return;

      const { allStyleAst, fileContents, duplicateRules, firstFileRules } =
        this.collectStylesFromFiles(htmlFiles);

      this.processFiles(
        htmlFiles,
        allStyleAst,
        fileContents,
        duplicateRules,
        firstFileRules,
      );
    });
  }

  /**
   * Collects styles and analyzes for duplication across HTML files.
   * @param {string[]} htmlFiles - Array of HTML file paths to process.
   * @returns {object} - An object containing ASTs, file contents, duplicate rules, and ownership mappings.
   */
  private collectStylesFromFiles(htmlFiles: string[]): {
    allStyleAst: Map<string, (Rule | AtRule)[]>;
    fileContents: Map<string, string>;
    duplicateRules: Set<string>;
    firstFileRules: Map<string, string>;
  } {
    // Batch-read all files into memory
    const fileContents = new Map<string, string>(
      htmlFiles.map((file) => [file, fs.readFileSync(file, 'utf-8')]),
    );

    const allStyleAst = new Map<string, (Rule | AtRule)[]>();
    const ruleOccurrences = new Map<string, Set<string>>();
    const firstFileRules = new Map<string, string>();

    // Process each file's content from memory
    fileContents.forEach((htmlContent, file) => {
      const cssBlocks = this.extractStyleTags(htmlContent);

      let fileAst: (Rule | AtRule)[] = [];
      cssBlocks.forEach((css) => {
        const parser = new CssAstParser(css);
        const ast = parser.parse();
        const extractedLayers = this.extractLayerContents(ast);

        fileAst = [...fileAst, ...ast, ...extractedLayers];

        parser.walkRules(ast, (rule) => {
          const serializedRule = this.serializeRule(rule);
          if (!ruleOccurrences.has(serializedRule)) {
            ruleOccurrences.set(serializedRule, new Set());
            firstFileRules.set(serializedRule, file);
          }
          ruleOccurrences.get(serializedRule)!.add(file);
        });
      });

      allStyleAst.set(file, fileAst);
    });

    const duplicateRules = new Set<string>();
    ruleOccurrences.forEach((files, rule) => {
      if (files.size > 1) duplicateRules.add(rule);
    });

    return { allStyleAst, fileContents, duplicateRules, firstFileRules };
  }

  /**
   * Processes files by consolidating and deduplicating their styles.
   * @param {string[]} htmlFiles - Array of HTML file paths to process.
   * @param {Map<string, (Rule | AtRule)[]>} allStyleAst - Mapping of file paths to their parsed CSS AST.
   * @param {Map<string, string>} fileContents - Mapping of file paths to their HTML contents.
   * @param {Set<string>} duplicateRules - Set of rules that appear in multiple files.
   * @param {Map<string, string>} firstFileRules - Mapping of rules to the first file where they appear.
   */
  private processFiles(
    htmlFiles: string[],
    allStyleAst: Map<string, (Rule | AtRule)[]>,
    fileContents: Map<string, string>,
    duplicateRules: Set<string>,
    firstFileRules: Map<string, string>,
  ): void {
    let isFirstFile = true;
    const updatedFiles = new Map<string, string>();

    for (const file of htmlFiles) {
      const ast = allStyleAst.get(file) || [];
      const { orderedRules, rulesToKeep } = this.extractRulesWithOrder(
        ast,
        duplicateRules,
        file,
        firstFileRules,
        isFirstFile,
      );

      const htmlContent = fileContents.get(file) || '';
      const htmlContentWithoutStyleTags = this.removeStyleTags(htmlContent);
      const message = isFirstFile
        ? HtmlStylesOptimizer.CONSOLIDATED_STYLES_MSG
        : HtmlStylesOptimizer.DUPLICATED_STYLES_FOUND_MSG;
      const stylesToInject = this.wrapWithStyleTag(
        isFirstFile ? orderedRules : rulesToKeep,
      );

      const updatedContent =
        message + stylesToInject + htmlContentWithoutStyleTags.trim();

      updatedFiles.set(file, updatedContent);
      isFirstFile = false;
    }

    updatedFiles.forEach((content, file) => {
      fs.writeFileSync(file, content);
    });
  }

  /**
   * Extracts rules within @layer blocks.
   * @param {(Rule | AtRule)[]} ast - The parsed CSS AST.
   * @returns {(Rule | AtRule)[]} - Flattened array of rules within layers.
   */
  private extractLayerContents(ast: (Rule | AtRule)[]): (Rule | AtRule)[] {
    return ast.reduce<(Rule | AtRule)[]>((acc, node) => {
      if (node.type === 'at-rule' && node.name === 'layer' && node.rules) {
        acc.push(...node.rules);
      }
      return acc;
    }, []);
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
   * Extracts and categorizes CSS rules, preserving order and hierarchy.
   * @param {(Rule | AtRule)[]} ast - The parsed CSS AST.
   * @param {Set<string>} duplicateRules - Set of rules that appear in multiple files.
   * @param {string} currentFile - The current file being processed.
   * @param {Map<string, string>} firstFileRules - Mapping of rules to the first file where they appear.
   * @param {boolean} isFirstFile - Whether the current file is the first in the set.
   * @returns {object} - An object containing ordered and unique rules for the file.
   */
  private extractRulesWithOrder(
    ast: (Rule | AtRule)[],
    duplicateRules: Set<string>,
    currentFile: string,
    firstFileRules: Map<string, string>,
    isFirstFile: boolean,
  ): { orderedRules: string[]; rulesToKeep: string[] } {
    const rulesToKeep: string[] = [];
    const orderedRules: string[] = [];

    ast.forEach((node) => {
      if (node.type === 'at-rule' && node.name === 'layer') {
        const layerRules = this.serializeLayer(
          node,
          duplicateRules,
          currentFile,
          firstFileRules,
          isFirstFile,
        );
        if (layerRules) orderedRules.push(layerRules);
      } else if (node.type === 'rule') {
        const serializedRule = this.serializeRule(node);
        if (!orderedRules.includes(serializedRule)) {
          orderedRules.push(serializedRule);
        }
        if (
          isFirstFile ||
          !duplicateRules.has(serializedRule) ||
          firstFileRules.get(serializedRule) === currentFile
        ) {
          rulesToKeep.push(serializedRule);
        }
      }
    });

    return { orderedRules, rulesToKeep };
  }

  /**
   * Serializes an @layer block and its rules into a CSS string.
   * @param {AtRule} layer - The @layer block to serialize.
   * @param {Set<string>} duplicateRules - Set of rules that appear in multiple files.
   * @param {string} currentFile - The current file being processed.
   * @param {Map<string, string>} firstFileRules - Mapping of rules to the first file where they appear.
   * @param {boolean} isFirstFile - Whether the current file is the first in the set.
   * @returns {string} - The serialized @layer block.
   */
  private serializeLayer(
    layer: AtRule,
    duplicateRules: Set<string>,
    currentFile: string,
    firstFileRules: Map<string, string>,
    isFirstFile: boolean,
  ): string {
    if (!layer.rules) return '';

    const layerContents = layer.rules
      .filter((rule) => rule.type === 'rule')
      .map((rule) => this.serializeRule(rule))
      .filter(
        (serializedRule) =>
          isFirstFile ||
          !duplicateRules.has(serializedRule) ||
          firstFileRules.get(serializedRule) === currentFile,
      );

    return layerContents.length ? `${layerContents.join(' ')}` : '';
  }

  private serializeNode(node: Rule): string {
    const declarations = node.declarations
      .map((decl) => `${decl.property}: ${decl.value};`)
      .join(' ');
    return `${node.selectors.join(', ')} { ${declarations} }`;
  }

  /**
   * Serializes a CSS rule into a CSS string.
   * @param {Rule} rule - The CSS rule to serialize.
   * @returns {string} - The serialized CSS rule.
   */
  private serializeRule(rule: Rule): string {
    return this.serializeNode(rule);
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
}

export default HtmlStylesOptimizer;
