import { DEFAULT_TOKEN_PROCESSOR_OPTIONS } from '../css-token-processor';
import { Token } from '../css-tokenizer';
import {
  TokenProcessorStrategy,
  TokenProcessorStrategyOptions,
} from './token-processor-strategy';

/**
 * Strategy for processing and extracting content from `@layer` rules in CSS.
 */
export class LayerProcessor implements TokenProcessorStrategy {
  /** Options for the Token Processor Strategy. */
  private options: Required<TokenProcessorStrategyOptions> =
    DEFAULT_TOKEN_PROCESSOR_OPTIONS;

  /**
   * Creates an instance of CssTokenProcessor.
   *
   * @param {TokenProcessorStrategyOptions} [options] - Default options for processing.
   */
  constructor(options?: TokenProcessorStrategyOptions) {
    this.options = this.mergeOptions(options);
  }

  /**
   * Sets the options for the LayerProcessor.
   *
   * @param {TokenProcessorStrategyOptions} options - Options to update.
   */
  setOptions(options: TokenProcessorStrategyOptions): void {
    this.options = { ...DEFAULT_TOKEN_PROCESSOR_OPTIONS, ...options };
  }

  /**
   * Processes the tokens to extract and transform `@layer` content.
   *
   * @param {Token[]} tokens - The tokens to process.
   * @param {TokenProcessorStrategyOptions} [options] - Options for the processing strategy.
   * @returns {Token[]} - The processed CSS string.
   */
  execute(
    tokens: Token[],
    options: TokenProcessorStrategyOptions = {},
  ): Token[] {
    this.options = options ? this.mergeOptions(options) : this.options;

    let processedTokens = tokens;

    if (this.options.discardLayerDeclarations) {
      processedTokens = this.discardLayerDeclarations(processedTokens);
    }

    if (this.options.extractFromLayers) {
      processedTokens = this.extractLayerContents(processedTokens);
    }

    return processedTokens;
  }

  /**
   * Extracts the content of `@layer` rules, excluding the `@layer` declarations.
   *
   * @param {Token[]} tokens - The tokens to filter.
   * @returns {Token[]} - The filtered tokens containing only the layer content.
   */
  private extractLayerContents(tokens: Token[]): Token[] {
    const result: Token[] = [];

    tokens.forEach((token) => {
      if (token.type === 'at-rule' && token.details.name === 'layer') {
        // Flatten the children of the @layer rule into the result
        result.push(...token.children);
      } else {
        // Add other tokens as-is
        result.push(token);
      }
    });

    return result;
  }

  /**
   * Discards tokens that represent standalone `@layer` declarations.
   *
   * @param {Token[]} tokens - The tokens to process.
   * @returns {Token[]} - The filtered tokens without `@layer` declarations.
   */
  private discardLayerDeclarations(tokens: Token[]): Token[] {
    return tokens.filter(
      (token) =>
        !(
          token.type === 'at-rule' &&
          token.details.name === 'layer' &&
          token.children.length === 0
        ),
    );
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
      ...DEFAULT_TOKEN_PROCESSOR_OPTIONS,
      ...options,
    };
  }
}
