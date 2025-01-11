import { Token } from '../css-tokenizer';

/**
 * Options for customizing the behavior of a token processor strategy.
 * @typedef {Object} TokenProcessorStrategyOptions
 * @property {boolean} [discardLayerDeclarations=false] - If true, removes standalone declarations like `@layer reset;`.
 * @property {boolean} [extract=false] - If true, extracts content within specific rules like `@layer`.
 * @property {boolean} [minify=false] - If true, generates a minified CSS string.
 */
export type TokenProcessorStrategyOptions = {
  discardLayerDeclarations?: boolean;
  extractFromLayers?: boolean;
  minify?: boolean;
};

/**
 * Interface for defining a CSS processor strategy.
 */
export interface TokenProcessorStrategy {
  /**
   * Executes the strategy on a given set of tokens.
   * @param {Token[]} tokens - The tokens to process.
   * @param {TokenProcessorStrategyOptions} [options] - Options for the processing strategy.
   * @returns {Token[]} - The processed CSS string.
   */
  execute(tokens: Token[], options?: TokenProcessorStrategyOptions): Token[];
}
