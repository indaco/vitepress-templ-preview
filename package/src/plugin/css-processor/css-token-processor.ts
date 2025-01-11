import { CssSerializer } from './css-serializer';
import { CssStringifier } from './css-stringifier';
import { Token } from './css-tokenizer';
import {
  TokenProcessorStrategy,
  TokenProcessorStrategyOptions,
} from './strategies/token-processor-strategy';

/**
 * Default options for the Token Processor Strategy.
 */
export const DEFAULT_TOKEN_PROCESSOR_OPTIONS: Required<TokenProcessorStrategyOptions> =
  {
    discardLayerDeclarations: true,
    extractFromLayers: false,
    minify: false,
  };

/**
 * Class for processing CSS tokens using a given strategy.
 */
export class CssTokenProcessor implements CssSerializer {
  private strategies: TokenProcessorStrategy[] = [];
  private options: Required<TokenProcessorStrategyOptions>;

  /**
   * Creates an instance of CssTokenProcessor.
   *
   * @param {TokenProcessorStrategy[]} strategies - The initial strategy to use for processing.
   * @param {TokenProcessorStrategyOptions} [options] - Default options for processing.
   */
  constructor(
    strategies?: TokenProcessorStrategy[],
    options?: TokenProcessorStrategyOptions,
  ) {
    this.strategies = Array.isArray(strategies) ? strategies : [];
    this.options = this.mergeOptions(options);
  }

  /**
   * Adds a new strategy for processing CSS tokens.
   *
   * @param {TokenProcessorStrategy} strategy - The strategy to add.
   */
  addStrategy(strategy: TokenProcessorStrategy): void {
    this.strategies.push(strategy);
  }

  /**
   * Sets the options for processing CSS tokens.
   *
   * @param {TokenProcessorStrategyOptions} options - The options to set.
   */
  setOptions(options: TokenProcessorStrategyOptions): void {
    this.options = this.mergeOptions(options);
  }

  /**
   * Executes the current strategy on a given set of tokens.
   *
   * @param {Token[]} tokens - The tokens to process.
   * @param {TokenProcessorStrategyOptions} [options] - Additional options for the strategy.
   * @returns {Token[]} - The processed tokens.
   */
  execute(tokens: Token[], options?: TokenProcessorStrategyOptions): Token[] {
    if (this.strategies.length === 0) {
      throw new Error('No strategy set. Please add at least one strategy.');
    }

    this.options = options ? this.mergeOptions(options) : this.options;

    // Process tokens through all strategies
    return this.strategies.reduce(
      (processedTokens, strategy) =>
        strategy.execute(processedTokens, this.options),
      tokens,
    );
  }

  /**
   * Builds the formatted or minified CSS string from the filtered tokens.
   *
   * @param {Token[]} tokens - The tokens to convert to CSS.
   * @param {TokenProcessorStrategyOptions} [options] - Additional options for building the CSS.
   * @returns {string} - The constructed CSS string.
   */
  public serialize(
    tokens: Token[],
    options?: TokenProcessorStrategyOptions,
  ): string {
    this.options = options ? this.mergeOptions(options) : this.options;

    if (tokens.length === 0) {
      return '';
    }

    return CssStringifier.serializeTokens(tokens, this.options.minify);
  }

  /**
   * Builds the formatted CSS string from the filtered tokens.
   *
   * @param {Token[]} tokens - The tokens to convert to CSS.
   * @returns {string} - The constructed CSS string.
   */
  public prettyPrint(tokens: Token[]): string {
    return this.serialize(tokens, { minify: false });
  }

  /**
   * Builds the minified CSS string from the filtered tokens.
   *
   * @param {Token[]} tokens - The tokens to convert to CSS.
   * @returns {string} - The constructed CSS string.
   */
  public minify(tokens: Token[]): string {
    return this.serialize(tokens, { minify: true });
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
