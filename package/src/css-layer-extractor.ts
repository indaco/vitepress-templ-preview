export class CSSLayerExtractor {
  // Singleton instance
  private static instance: CSSLayerExtractor;

  // Private constructor to prevent instantiation
  private constructor() {}

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
   * Extracts the top-level @layer declarations from the content.
   * @param content - The CSS content to process.
   * @returns The top-level layer declarations as a string.
   */
  public extractTopLayerDeclarations(content: string): string {
    const match = content.match(/@layer[^;]*;/g);
    return match ? match.join(' ') : '';
  }

  /**
   * Cleans the <style> tags by extracting and removing all @layer blocks.
   * @param content - The CSS content to process.
   * @returns The cleaned style tag.
   */
  public cleanStyleTags(content: string): string {
    const { extractedContent, cleanedContent } =
      this.extractAndRemoveLayerBlocks(content);

    const finalContent = [...extractedContent, cleanedContent]
      .map((str) => str.trim())
      .filter(Boolean)
      .join('\n')
      .trim();

    if (!finalContent) return ''; // If final content is empty, return an empty string

    return `<style type="text/css">\n${finalContent}\n</style>`;
  }

  /**
   * Extracts layer blocks from the content.
   * @param content - The CSS content to process.
   * @returns An array of extracted blocks.
   */
  public extractLayerBlocks(content: string): string[] {
    const extractedBlocks: string[] = [];
    let isInLayer = false;
    let currentBlock = '';
    let braceDepth = 0;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      // Detect start of @layer
      if (!isInLayer && content.slice(i, i + 6).startsWith('@layer')) {
        isInLayer = true;
        i = content.indexOf('{', i); // Move to the first opening brace
        if (i === -1) break;
        braceDepth = 1; // We are inside the first block
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
  public extractCssRules(layerContent: string): string[] {
    const cssRuleRegex = /[^{]+\{[^}]*\}/g;
    const matches = layerContent.match(cssRuleRegex) || [];
    return matches.map((rule) => rule.trim());
  }

  /**
   * Extracts and removes all @layer blocks from the content.
   * @param content - The CSS content to process.
   * @returns An object with the extracted content and the cleaned content.
   */
  public extractAndRemoveLayerBlocks(content: string): {
    extractedContent: string[];
    cleanedContent: string;
  } {
    let isInLayer = false;
    let braceDepth = 0;
    let currentBlock = '';
    const extractedBlocks: string[] = [];
    let cleanedContent = '';

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      // Detect start of @layer
      if (!isInLayer && content.slice(i, i + 6).startsWith('@layer')) {
        isInLayer = true;
        i = content.indexOf('{', i); // Move to first '{'
        braceDepth = 1; // Start tracking the block
        continue;
      }

      if (isInLayer) {
        if (char === '{') braceDepth++;
        if (char === '}') braceDepth--;

        if (braceDepth > 0) currentBlock += char;

        if (braceDepth === 0) {
          const cleanedBlock = this.flattenCssContent(currentBlock);
          if (cleanedBlock.trim()) extractedBlocks.push(cleanedBlock);
          currentBlock = '';
          isInLayer = false;
        }
      } else {
        cleanedContent += char;
      }
    }

    cleanedContent = cleanedContent.replace(/}\s*}/g, '}').trim();
    cleanedContent = this.flattenCssContent(cleanedContent);

    return { extractedContent: extractedBlocks, cleanedContent };
  }

  /**
   * Flattens CSS content by removing extra newlines and spaces.
   * @param content - The CSS content to process.
   * @returns The flattened CSS content.
   */
  public flattenCssContent(content: string): string {
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
