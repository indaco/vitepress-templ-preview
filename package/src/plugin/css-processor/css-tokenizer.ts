import type { CssNode, Rule, Atrule, Declaration } from 'css-tree';
import { parse, walk, generate } from 'css-tree';

/**
 * Base fields shared by all token types.
 */
interface BaseToken {
  /** The serialized value of the token. */
  value: string;
  /** Nested tokens for hierarchical structures. */
  children: Token[];
}

/**
 * Token representing a CSS rule (selector block).
 */
export interface RuleToken extends BaseToken {
  type: 'rule';
  details: { selector: string };
}

/**
 * Token representing a CSS at-rule (@media, @layer, etc.).
 */
export interface AtRuleToken extends BaseToken {
  type: 'at-rule';
  details: { name: string; prelude: string };
}

/**
 * Token representing a CSS declaration (property: value).
 */
export interface DeclarationToken extends BaseToken {
  type: 'declaration';
  details: { property: string; value: string };
}

/**
 * Discriminated union of all CSS token types.
 */
export type Token = RuleToken | AtRuleToken | DeclarationToken;

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
    this.tokens = [];

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
  private createAtRuleToken(node: Atrule): AtRuleToken {
    const prelude = node.prelude ? generate(node.prelude) : '';
    return {
      type: 'at-rule',
      value: `@${node.name} ${prelude}`.trim(),
      details: { name: node.name, prelude },
      children: [],
    };
  }

  /**
   * Creates a token for a rule node.
   *
   * @param {csstree.Rule} node - The rule node.
   * @returns {RuleToken} - The generated token.
   */
  private createRuleToken(node: Rule): RuleToken {
    let selector = generate(node.prelude);
    // Normalize spaces after commas in lists for pseudo-classes
    selector = selector.replace(/,\s*/g, ', ');

    return {
      type: 'rule',
      value: selector,
      details: { selector },
      children: [],
    };
  }

  /**
   * Creates a token for a declaration node.
   *
   * @param {csstree.Declaration} node - The declaration node.
   * @returns {DeclarationToken} - The generated token.
   */
  private createDeclarationToken(node: Declaration): DeclarationToken {
    return {
      type: 'declaration',
      value: `${node.property}: ${generate(node.value)};`,
      details: { property: node.property, value: generate(node.value) },
      children: [],
    };
  }
}
