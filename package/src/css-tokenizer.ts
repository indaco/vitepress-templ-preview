/**
 * Represents a token parsed from a CSS string.
 * @typedef {Object} Token
 * @property {'text' | 'block-start' | 'block-end' | 'colon' | 'semicolon' | 'atRule'} type - The type of the token.
 * @property {string} value - The raw value of the token.
 * @property {string} [name] - The name of the at-rule (only for 'atRule' type).
 * @property {string} [params] - The parameters of the at-rule (only for 'atRule' type).
 */
export type Token = {
  type: 'text' | 'block-start' | 'block-end' | 'colon' | 'semicolon' | 'atRule';
  value: string;
  name?: string; // For atRule
  params?: string; // For atRule
};

/**
 * Tokenizes a CSS string into meaningful tokens.
 */
export class CssTokenizer {
  /**
   * The CSS string to be tokenized.
   * @private
   * @type {string}
   */
  private css: string;

  /**
   * The current position in the CSS string.
   * @private
   * @type {number}
   */
  private pos: number = 0;

  /**
   * Creates an instance of CssTokenizer.
   * @param {string} css - The CSS string to tokenize.
   */
  constructor(css: string) {
    this.css = css;
  }

  /**
   * Tokenizes the CSS string into an array of tokens.
   * @returns {Token[]} An array of tokens parsed from the CSS string.
   */
  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.pos < this.css.length) {
      const char = this.css[this.pos];

      switch (char) {
        case '{':
          tokens.push({ type: 'block-start', value: char });
          this.pos++;
          break;

        case '}':
          tokens.push({ type: 'block-end', value: char });
          this.pos++;
          break;

        case ':':
          // Handle pseudo-selectors like `&:hover`
          if (tokens.length > 0 && tokens[tokens.length - 1].value === '&') {
            tokens[tokens.length - 1].value += this.readUntil(/[;{}]/).trim();
          } else {
            tokens.push({ type: 'colon', value: char });
            this.pos++;
          }
          break;

        case ';':
          tokens.push({ type: 'semicolon', value: char });
          this.pos++;
          break;

        case '@':
          // Parse at-rules
          const atRuleContent = this.readUntil(/[{;]/).trim();
          const [rawName, ...paramParts] = atRuleContent.split(/\s+/);
          tokens.push({
            type: 'atRule',
            value: `@${rawName.slice(1)}`,
            name: rawName.slice(1),
            params: paramParts.join(' ').trim(),
          });
          if (this.peek() === ';') this.pos++; // Consume semicolon
          break;

        default:
          if (/\s/.test(char)) {
            // Skip whitespace
            this.pos++;
          } else {
            // Handle general text or selectors
            tokens.push({
              type: 'text',
              value: this.readUntil(/[;:{}]/).trim(),
            });
          }
          break;
      }
    }

    return tokens;
  }

  /**
   * Reads characters from the CSS string until the specified stop pattern is matched.
   * @private
   * @param {RegExp} stopPattern - A regular expression defining the stopping condition.
   * @returns {string} The substring read until the stop pattern was matched.
   */
  private readUntil(stopPattern: RegExp): string {
    let value = '';
    while (
      this.pos < this.css.length &&
      !stopPattern.test(this.css[this.pos])
    ) {
      value += this.css[this.pos];
      this.pos++;
    }
    return value;
  }

  /**
   * Peeks at the next character in the CSS string without advancing the position.
   * @private
   * @returns {string | null} The next character, or null if at the end of the string.
   */
  private peek(): string | null {
    return this.pos + 1 < this.css.length ? this.css[this.pos + 1] : null;
  }
}
