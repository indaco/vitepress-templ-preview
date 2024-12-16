export class CSSLayerExtractor {
  // Singleton instance
  protected static instance: CSSLayerExtractor;

  // Private constructor to prevent instantiation
  protected constructor() {}

  /**
   * Method to get the singleton instance.
   */
  public static getInstance(): CSSLayerExtractor {
    if (!CSSLayerExtractor.instance) {
      CSSLayerExtractor.instance = new CSSLayerExtractor();
    }
    return CSSLayerExtractor.instance;
  }

  /**
   * Main function that runs the "cleanStyleTags" logic.
   * @param content - The CSS content to process.
   * @returns The cleaned style tag.
   */
  public run(content: string): string {
    return this.cleanStyleTags(content);
  }

  /**
   * Removes <style> tags but **keeps the inner content**.
   * @param content - The CSS content that may contain <style> tags.
   * @returns The content with <style> tags removed but inner CSS preserved.
   */
  protected removeStyleTags(content: string): string {
    return content
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/g, '$1') // Capture inner content of <style> and remove the tags
      .trim();
  }

  /**
   * Extracts the top-level @layer declarations from the content.
   * @param content - The CSS content to process.
   * @returns The top-level layer declarations as a string.
   */
  protected extractTopLayerDeclarations(content: string): string {
    const match = content.match(/@layer[^;]*;/g);
    return match ? match.join(' ') : '';
  }

  /**
   * Cleans the <style> tags by extracting and removing all @layer blocks.
   * @param content - The CSS content to process.
   * @returns The cleaned style tag.
   */
  /**
   * Cleans the <style> tags from the provided content.
   * @param content - The CSS content that may contain <style> tags.
   * @returns The content as a single <style> block.
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
   * Extracts layer blocks from the content.
   * @param content - The CSS content to process.
   * @returns An array of extracted blocks.
   */
  protected extractLayerBlocks(content: string): string[] {
    const extractedBlocks: string[] = [];
    let isInLayer = false;
    let currentBlock = '';
    let braceDepth = 0;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if (!isInLayer && content.slice(i, i + 6).startsWith('@layer')) {
        isInLayer = true;
        i = content.indexOf('{', i);
        if (i === -1) break;
        braceDepth = 1;
        continue;
      }

      if (isInLayer) {
        if (char === '{') braceDepth++;
        if (char === '}') braceDepth--;

        if (braceDepth > 0) currentBlock += char;

        if (braceDepth === 0) {
          const cleanedBlock = this.flattenCssContent(currentBlock);
          extractedBlocks.push(cleanedBlock);
          currentBlock = '';
          isInLayer = false;
        }
      }
    }

    return extractedBlocks;
  }

  /**
   * Extracts individual CSS rules from a single @layer block.
   * @param layerContent - The content of the layer.
   * @returns An array of extracted CSS rules.
   */
  protected extractCssRules(layerContent: string): string[] {
    const cssRuleRegex = /[^{]+\{[^}]*\}/g;
    const matches = layerContent.match(cssRuleRegex) || [];
    return matches.map((rule) => rule.trim());
  }

  /**
   * Extracts and removes all @layer blocks from the content.
   * @param content - The CSS content to process.
   * @returns An object with the extracted content and the cleaned content.
   */
  protected extractAndRemoveLayerBlocks(content: string): {
    extractedContent: string[];
    cleanedContent: string;
  } {
    // Step 1: Extract the layer blocks
    const extractedContent = this.extractLayerBlocks(content);

    // Step 2: Remove the extracted layer content from the original content
    let cleanedContent = content;
    extractedContent.forEach((block) => {
      const escapedBlock = block.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape for regex
      const regex = new RegExp(`@layer[^}]*{[^}]*${escapedBlock}[^}]*}`, 'g');
      cleanedContent = cleanedContent.replace(regex, '');
    });

    // Step 3: Flatten and clean the remaining content
    cleanedContent = cleanedContent.replace(/}\s*}/g, '}').trim(); // Remove extra braces
    cleanedContent = this.flattenCssContent(cleanedContent); // Flatten the remaining CSS

    return { extractedContent, cleanedContent };
  }

  /**
   * Flattens CSS content by removing extra newlines and spaces.
   * @param content - The CSS content to process.
   * @returns The flattened CSS content.
   */
  protected flattenCssContent(content: string): string {
    return content
      .replace(/\s*\n\s*/g, ' ') // Replace newlines with spaces
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with one
      .replace(/;\s*/g, '; ') // Add a space after semicolon
      .replace(/\s*}\s*/g, ' } ') // Space after closing brace
      .replace(/\s*{\s*/g, ' { ') // Space around opening brace
      .replace(/}\s*}/g, '}') // Remove double closing braces
      .replace(/;\s*}/g, '; }') // Semicolon before closing brace
      .trim();
  }
}
