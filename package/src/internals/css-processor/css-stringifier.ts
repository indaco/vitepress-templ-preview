import { Token } from './css-tokenizer';

/**
 * A utility class for converting CSS tokens back into a CSS string.
 * Supports pretty-printing and minification.
 */
export class CssStringifier {
  // ======================== Public Methods ========================

  /**
   * Converts tokens back into a CSS string.
   *
   * @param {Token[]} tokens - The tokens to stringify.
   * @param {boolean} [minify=false] - Whether to minify the output CSS.
   * @returns {string} - The reconstructed CSS string.
   */
  static serializeTokens(tokens: Token[], minify: boolean = false): string {
    return tokens
      .map((token) => this.processToken(token, minify, 0))
      .join(minify ? '' : '\n\n');
  }

  /**
   * Pretty-prints the CSS string from tokens.
   *
   * @param {Token[]} tokens - The tokens to stringify.
   * @returns {string} - The pretty-printed CSS string.
   */
  static prettyPrint(tokens: Token[]): string {
    return this.serializeTokens(tokens, false);
  }

  /**
   * Minifies the CSS string from tokens.
   *
   * @param {Token[]} tokens - The tokens to stringify.
   * @returns {string} - The minified CSS string.
   */
  static minify(tokens: Token[]): string {
    return this.serializeTokens(tokens, true);
  }

  /**
   * Logs tokens for debugging purposes.
   *
   * @param {Token[]} tokens - The tokens to debug.
   */
  static log(tokens: Token[]) {
    console.dir(tokens, {
      showHidden: true,
      depth: 99,
      colors: true,
    });
  }

  // ======================== Private Methods ========================

  /**
   * Processes an individual token and returns its serialized string.
   *
   * @param {Token} token - The token to process.
   * @param {boolean} minify - Whether to minify the output CSS.
   * @param {number} indentationLevel - The current indentation level.
   * @returns {string} - The serialized string for the token.
   */
  private static processToken(
    token: Token,
    minify: boolean,
    indentationLevel: number,
  ): string {
    switch (token.type) {
      case 'rule':
        return this.serializeRule(token, minify, indentationLevel);
      case 'declaration':
        return this.serializeDeclaration(token, minify, indentationLevel);
      case 'at-rule':
        return this.serializeAtRule(token, minify, indentationLevel);
      default:
        return '';
    }
  }

  // ======================== Token Serializers ========================

  /**
   * Serializes a rule token.
   *
   * @param {Token} token - The rule token to serialize.
   * @param {boolean} minify - Whether to minify the output CSS.
   * @param {number} indentationLevel - The current indentation level.
   * @returns {string} - The serialized rule string.
   */
  private static serializeRule(
    token: Token,
    minify: boolean,
    indentationLevel: number,
  ): string {
    const selector = token.details.selector ?? '';
    const indent = minify ? '' : '  '.repeat(indentationLevel);
    const children = token.children
      ?.map((child) => this.processToken(child, minify, indentationLevel + 1))
      .join(minify ? '' : '\n');
    const block = minify ? `{${children}}` : ` {\n${children}\n${indent}}`;
    return `${indent}${selector}${block}`;
  }

  /**
   * Serializes a declaration token.
   *
   * @param {Token} token - The declaration token to serialize.
   * @param {boolean} minify - Whether to minify the output CSS.
   * @param {number} indentationLevel - The current indentation level.
   * @returns {string} - The serialized declaration string.
   */
  private static serializeDeclaration(
    token: Token,
    minify: boolean,
    indentationLevel: number,
  ): string {
    const indent = minify ? '' : '  '.repeat(indentationLevel);
    if (minify) {
      return `${token.details.property}:${token.details.value};`;
    }
    return `${indent}${token.value}`;
  }

  /**
   * Serializes an at-rule token.
   *
   * @param {Token} token - The at-rule token to serialize.
   * @param {boolean} minify - Whether to minify the output CSS.
   * @param {number} indentationLevel - The current indentation level.
   * @returns {string} - The serialized at-rule string.
   */
  private static serializeAtRule(
    token: Token,
    minify: boolean,
    indentationLevel: number,
  ): string {
    const indent = minify ? '' : '  '.repeat(indentationLevel);
    const children = token.children
      ?.map((child) => this.processToken(child, minify, indentationLevel + 1))
      .join(minify ? '' : '\n');
    const block = children
      ? minify
        ? `{${children}}`
        : ` {\n${children}\n${indent}}`
      : '';
    return `${indent}${token.value}${block}`;
  }
}
