import { Token } from './css-tokenizer';
import { TokenProcessorStrategyOptions } from './strategies/token-processor-strategy';

/**
 * Interface for serializing CSS tokens into a CSS string representation.
 */
export interface CssSerializer {
  /**
   * Serializes a list of CSS tokens into a formatted or minified CSS string.
   *
   * @param {Token[]} tokens - The list of tokens to serialize.
   * @param {TokenProcessorStrategyOptions} options - Options for customizing the output.
   * @param {boolean} [options.minimize=false] - If true, generates a minified CSS string.
   * @param {boolean} [options.extract=false] - If true, extracts specific content from the tokens (e.g., `@layer` rules).
   * @param {boolean} [options.discardDeclaration=false] - If true, removes specific declarations (e.g., `@layer reset;`).
   * @returns {string} - The generated CSS string.
   */
  serialize(tokens: Token[], options: TokenProcessorStrategyOptions): string;
}
