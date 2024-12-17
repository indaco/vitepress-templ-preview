import { CssLayerStateMachine } from './css-layer-state-machine';
import { flattenCssContent } from './css-utils';

/**
 * @class CSSLayerExtractor
 * @description
 * Singleton class to extract, clean, and process CSS content containing `@layer` blocks.
 *
 * **Usage Example:**
 * ```typescript
 * const extractor = CSSLayerExtractor.getInstance();
 * const result = extractor.run('<style>@layer base { .btn { color: red; } }</style>');
 * console.log(result);
 * // Output: <style type="text/css">\n.btn { color: red; }\n</style>
 * ```
 */
export class CSSLayerExtractor {
  /**
   * Singleton instance of the `CSSLayerExtractor`.
   * Ensures only one instance of the class exists.
   *
   * @protected
   * @type {CSSLayerExtractor}
   */
  protected static instance: CSSLayerExtractor;

  /**
   * Private constructor to enforce singleton design.
   * External instantiation is not allowed.
   *
   * @protected
   */
  protected constructor() {}

  /**
   * Returns the singleton instance of the `CSSLayerExtractor`.
   * If the instance does not exist, it will be created.
   *
   * @returns {CSSLayerExtractor} The singleton instance of the `CSSLayerExtractor`.
   */
  public static getInstance(): CSSLayerExtractor {
    if (!CSSLayerExtractor.instance) {
      CSSLayerExtractor.instance = new CSSLayerExtractor();
    }
    return CSSLayerExtractor.instance;
  }

  /**
   * Entry point method to run the "cleanStyleTags" logic on the provided content.
   *
   * @param {string} content - The CSS content to be processed.
   * @returns {string} The processed CSS content wrapped in a `<style>` tag.
   */
  public run(content: string): string {
    return this.cleanStyleTags(content);
  }

  /**
   * Removes the `<style>` tags but **preserves the inner content**.
   *
   * @param {string} content - The CSS content that may contain `<style>` tags.
   * @returns {string} The content with `<style>` tags removed.
   */
  protected removeStyleTags(content: string): string {
    return content
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/g, '$1') // Capture inner content of <style> and remove the tags
      .trim();
  }

  /**
   * Extracts the top-level `@layer` declarations from the CSS content.
   *
   * @param {string} content - The CSS content to be processed.
   * @returns {string} The top-level `@layer` declarations as a single string.
   */
  protected extractTopLayerDeclarations(content: string): string {
    const match = content.match(/@layer[^;]*;/g);
    return match ? match.join(' ') : '';
  }

  /**
   * Cleans the CSS content by removing unnecessary `<style>` tags, and flattening layers.
   *
   * @param {string} content - The CSS content to be cleaned.
   * @returns {string} The cleaned and formatted content wrapped in a single `<style>` tag.
   */
  protected cleanStyleTags(content: string): string {
    const { extractedContent, cleanedContent } =
      this.extractAndRemoveLayerBlocks(content);

    // Remove <style> tags from cleanedContent while preserving inner content
    const cleanedInnerContent = this.removeStyleTags(cleanedContent);

    const meaningfulContent = [...extractedContent, cleanedInnerContent]
      .map((str) => str.trim())
      .filter(Boolean)
      .join('\n')
      .trim();

    if (!meaningfulContent) return '';

    return `<style type="text/css">\n${meaningfulContent}\n</style>`;
  }

  /**
   * Extracts CSS content from all `@layer` blocks.
   *
   * @param {string} content - The CSS content to be processed.
   * @returns {string[]} An array of extracted blocks of CSS from `@layer` declarations.
   */
  protected extractLayerBlocks(content: string): string[] {
    const stateMachine = new CssLayerStateMachine();
    return stateMachine.extractLayerBlocks(content);
  }

  /**
   * Extracts and removes `@layer` blocks from the content.
   *
   * @param {string} content - The CSS content to process.
   * @returns {{ extractedContent: string[], cleanedContent: string }}
   * An object containing the extracted content and the cleaned content.
   */
  protected extractAndRemoveLayerBlocks(content: string): {
    extractedContent: string[];
    cleanedContent: string;
  } {
    // Step 1: Extract the layer blocks
    const extractedContent = this.extractLayerBlocks(content);
    // Step 2: Remove the extracted layer content from the original content
    let cleanedContent = this.removeLayerContent(content, extractedContent);
    // Step 3: Flatten and clean the remaining content
    cleanedContent = flattenCssContent(cleanedContent);

    return { extractedContent, cleanedContent };
  }

  /**
   * Removes `@layer` content blocks from the provided CSS content.
   *
   * This method iterates over the extracted `@layer` blocks and removes them from the original content.
   *
   * @private
   * @param {string} content - The original CSS content containing `@layer` declarations.
   * @param {string[]} extractedContent - An array of extracted CSS blocks from `@layer` declarations.
   *
   * @returns {string} The cleaned CSS content with `@layer` declarations removed.
   *
   */
  private removeLayerContent(
    content: string,
    extractedContent: string[],
  ): string {
    let cleanedContent = content;

    // Loop over each extracted block to remove its corresponding @layer declaration
    extractedContent.forEach((block) => {
      // Escape special characters in the block for regex use
      const escapedBlock = block.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // regex to match the full @layer declaration containing this block
      const regex = new RegExp(`@layer[^}]*{[^}]*${escapedBlock}[^}]*}`, 'g');
      // Remove the matched @layer declaration from the cleaned content
      cleanedContent = cleanedContent.replace(regex, '');
    });

    // Remove any residual double closing braces (this can happen if nested layers are present)
    cleanedContent = cleanedContent.replace(/}\s*}/g, '}').trim(); //
    return cleanedContent;
  }
}
