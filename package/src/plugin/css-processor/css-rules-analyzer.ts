import { createHash } from 'crypto';
import {
  CssTokenProcessor,
  DEFAULT_TOKEN_PROCESSOR_OPTIONS,
} from './css-token-processor';
import { CssTokenizer, Token } from './css-tokenizer';
import { TokenProcessorStrategyOptions } from './strategies/token-processor-strategy';

/**
 * Class for analyzing and identifying unique and duplicate CSS rules.
 */
export class CssRulesAnalyzer {
  private options: Required<TokenProcessorStrategyOptions>;
  private cssProcessor: CssTokenProcessor;

  /**
   * Creates an instance of `CssRuleAnalyzer`.
   *
   * @param {CssTokenProcessor} cssProcessor - Instance of `CssTokenProcessor` for token processing.
   * @param {TokenProcessorStrategyOptions} [options] - Options for processing CSS tokens.
   */
  constructor(
    cssProcessor: CssTokenProcessor,
    options?: TokenProcessorStrategyOptions,
  ) {
    this.cssProcessor = cssProcessor;
    this.options = this.mergeOptions(options);
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
   * Analyzes multiple CSS inputs to identify unique and duplicate rules.
   * Filters out invalid or malformed CSS rules.
   *
   * @param {string[]} cssInputs - Array of CSS input strings.
   * @returns {{
   *   unique: Map<string, { rule: string; sources: string[] }>;
   *   duplicates: Map<string, { rule: string; sources: string[] }>;
   * }}
   */
  analyze(cssInputs: string[]): {
    unique: Map<string, { rule: string; sources: string[] }>;
    duplicates: Map<string, { rule: string; sources: string[] }>;
  } {
    const ruleHashes = new Map<string, { rule: string; sources: string[] }>();
    const duplicates = new Map<string, { rule: string; sources: string[] }>();

    // Process each input and extract normalized rules
    cssInputs.forEach((css, index) => {
      const tokens = new CssTokenizer().tokenize(css);
      const tokensWithoutLayers = this.cssProcessor.execute(
        tokens,
        this.options,
      );

      const rules = this.minifyRules(tokensWithoutLayers);

      for (const rule of rules) {
        const hash = this.hashRule(rule);

        if (ruleHashes.has(hash)) {
          const entry = ruleHashes.get(hash)!;
          if (!entry.sources.includes(`Input #${index + 1}`)) {
            entry.sources.push(`Input #${index + 1}`);
          }
          duplicates.set(hash, entry);
          ruleHashes.delete(hash); // Remove from unique list
        } else if (!duplicates.has(hash)) {
          ruleHashes.set(hash, { rule, sources: [`Input #${index + 1}`] });
        }
      }
    });

    return {
      unique: ruleHashes,
      duplicates,
    };
  }

  minifyRules(tokens: Token[]): string[] {
    const rules: string[] = [];
    tokens.forEach((token) => rules.push(this.cssProcessor.minify([token])));
    return rules;
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

  /**
   * Generates a hash for a CSS rule.
   *
   * @param {string} rule - The CSS rule to hash.
   * @returns {string} - The hash of the rule.
   */
  private hashRule(rule: string): string {
    return createHash('sha256').update(rule).digest('hex');
  }
}
