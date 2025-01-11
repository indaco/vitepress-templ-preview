import type { CssNode, Rule, Atrule, Declaration } from 'css-tree';
import { parse, walk, generate } from 'css-tree';

/**
 * Type for specific keys used in token details.
 */
type DetailsKeys = 'property' | 'value' | 'name';

/**
 * Type for token details, supporting specific and additional contextual keys.
 */
type Details = {
  [K in DetailsKeys]?: string;
} & Record<Exclude<string, DetailsKeys>, string>;

/**
 * Represents a token generated during the CSS parsing process.
 */
export type Token = {
  /** The type of token ('rule', 'at-rule', or 'declaration'). */
  type: 'rule' | 'at-rule' | 'declaration';
  /** The serialized value of the token. */
  value: string;
  /** Additional contextual details about the token. */
  details: Details;
  /** Nested tokens for hierarchical structures. */
  children: Token[];
};

/**
 * Tokenizer class for parsing CSS into structured tokens using csstree.
 */
export class CssTokenizer {
  /** Internal list of tokens generated during parsing. */
  private tokens: Token[] = [];

  // ======================== Public Methods ========================

  /**
   * Parses a CSS string and generates a list of tokens.
   *
   * @param {string} css - The CSS string to tokenize.
   * @returns {Token[]} - The list of generated tokens.
   */
  tokenize(css: string): Token[] {
    const ast = parse(css, {
      positions: true,
    });

    let parentToken: Token | null = null;

    const parentStack: Token[] = []; // Stack to track parent tokens

    // Traverse the AST and build tokens
    walk(ast, {
      enter: (node: CssNode) => {
        parentToken = parentStack[parentStack.length - 1] || null;

        switch (node.type) {
          case 'Atrule':
            this.handleAtRule(node, parentToken, parentStack);
            break;
          case 'Rule':
            this.handleRule(node, parentToken, parentStack);
            break;
          case 'Declaration':
            this.handleDeclaration(node, parentToken);
            break;
        }
      },
      leave: (node: CssNode) => {
        this.popFromStackIfNeeded(node, parentStack);
        parentToken = parentStack[parentStack.length - 1] || null;
      },
    });

    return this.tokens;
  }

  // ======================== Token Handlers ========================

  /**
   * Processes an at-rule node and generates a corresponding token.
   *
   * @param {csstree.Atrule} node - The at-rule node to process.
   * @param {Token | null} parentToken - The parent token, if any.
   * @param {Token[]} parentStack - The stack of parent tokens.
   */
  private handleAtRule(
    node: Atrule,
    parentToken: Token | null,
    parentStack: Token[],
  ): void {
    const atRuleToken = this.createAtRuleToken(node);
    this.addTokenToParent(atRuleToken, parentToken, parentStack);
  }

  /**
   * Processes a rule node and generates a corresponding token.
   *
   * @param {csstree.Rule} node - The rule node to process.
   * @param {Token | null} parentToken - The parent token, if any.
   * @param {Token[]} parentStack - The stack of parent tokens.
   */
  private handleRule(
    node: Rule,
    parentToken: Token | null,
    parentStack: Token[],
  ): void {
    const ruleToken = this.createRuleToken(node);
    this.addTokenToParent(ruleToken, parentToken, parentStack);
  }

  /**
   * Processes a declaration node and generates a corresponding token.
   *
   * @param {csstree.Declaration} node - The declaration node to process.
   * @param {Token | null} parentToken - The parent token, if any.
   */
  private handleDeclaration(
    node: Declaration,
    parentToken: Token | null,
  ): void {
    const declarationToken = this.createDeclarationToken(node);
    if (parentToken) {
      parentToken.children.push(declarationToken); // Attach to parent
    }
  }

  // ======================== Utility Methods ========================

  /**
   * Adds a token to the appropriate parent or top-level collection.
   *
   * @param {Token} token - The token to add.
   * @param {Token | null} parentToken - The parent token, if any.
   * @param {Token[]} parentStack - The stack of parent tokens.
   */
  private addTokenToParent(
    token: Token,
    parentToken: Token | null,
    parentStack: Token[],
  ): void {
    if (parentToken) {
      parentToken.children.push(token);
    } else {
      this.tokens.push(token);
    }
    this.pushToStackIfNeeded(token, parentStack); // Only push non-declaration tokens onto the stack
  }

  /**
   * Pushes a token onto the parent stack if applicable.
   *
   * @param {Token} token - The token to push.
   * @param {Token[]} parentStack - The stack of parent tokens.
   */
  private pushToStackIfNeeded(token: Token, parentStack: Token[]): void {
    if (token.type !== 'declaration') {
      parentStack.push(token);
    }
  }

  /**
   * Removes a token from the stack if it is an at-rule or rule.
   *
   * @param {csstree.CssNode} node - The current AST node.
   * @param {Token[]} parentStack - The stack of parent tokens.
   */
  private popFromStackIfNeeded(node: CssNode, parentStack: Token[]): void {
    if (node.type === 'Atrule' || node.type === 'Rule') {
      parentStack.pop();
    }
  }

  // ======================== Token Creators ========================

  /**
   * Creates a token for an at-rule node.
   *
   * @param {csstree.Atrule} node - The at-rule node.
   * @returns {Token} - The generated token.
   */
  private createAtRuleToken(node: Atrule): Token {
    const prelude = node.prelude ? generate(node.prelude) : '';
    return this.createToken('at-rule', `@${node.name} ${prelude}`.trim(), {
      name: node.name,
      prelude,
    });
  }

  /**
   * Creates a token for a rule node.
   *
   * @param {csstree.Rule} node - The rule node.
   * @returns {Token} - The generated token.
   */
  private createRuleToken(node: Rule): Token {
    let selector = generate(node.prelude);
    // Normalize spaces after commas in lists for pseudo-classes
    selector = selector.replace(/,\s*/g, ', ');

    return this.createToken('rule', selector, { selector });
  }

  /**
   * Creates a token for a declaration node.
   *
   * @param {csstree.Declaration} node - The declaration node.
   * @returns {Token} - The generated token.
   */
  private createDeclarationToken(node: Declaration): Token {
    return this.createToken(
      'declaration',
      `${node.property}: ${generate(node.value)};`,
      { property: node.property, value: generate(node.value) },
    );
  }

  /**
   * Creates a token with the given type and details.
   *
   * @param {'rule' | 'at-rule' | 'declaration'} type - The token type.
   * @param {string} value - The serialized value of the token.
   * @param {Details} details - The token details.
   * @returns {Token} - The created token.
   */
  private createToken(
    type: 'rule' | 'at-rule' | 'declaration',
    value: string,
    details: Details,
  ): Token {
    return {
      type,
      value,
      details,
      children: [],
    };
  }
}
