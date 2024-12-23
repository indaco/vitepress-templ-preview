import { CssTokenizer, Token } from './css-tokenizer';

export type Declaration = {
  property: string;
  value: string;
};

export type Rule = {
  type: 'rule';
  selectors: string[];
  declarations: Declaration[];
  nestedRules?: Rule[];
};

export type AtRule = {
  type: 'at-rule';
  name: string;
  params: string;
  rules?: (Rule | AtRule)[];
};

export class CssAstParser {
  private tokens: Token[];
  private current: number = 0;

  constructor(css: string) {
    const tokenizer = new CssTokenizer(css);
    this.tokens = tokenizer.tokenize();
  }

  public parse(): (Rule | AtRule)[] {
    const ast: (Rule | AtRule)[] = [];

    while (!this.isAtEnd()) {
      const token = this.peek();
      if (token?.type === 'atRule') {
        ast.push(this.parseAtRule());
      } else {
        ast.push(this.parseRule());
      }
    }

    return ast;
  }

  /**
   * Traverses all rules and executes a callback on each.
   * @param {Array<Rule | AtRule>} ast - The AST to traverse.
   * @param {(rule: Rule) => void} callback - The callback to execute on each rule.
   */
  public walkRules(
    ast: (Rule | AtRule)[],
    callback: (rule: Rule) => void,
  ): void {
    const stack: (Rule | AtRule)[] = [...ast].reverse(); // Reverse top-level rules for correct order

    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) continue;

      if (node.type === 'rule') {
        callback(node);
        if (node.nestedRules) {
          stack.push(...node.nestedRules.reverse()); // Push nested rules in reverse order
        }
      } else if (node.type === 'at-rule' && node.rules) {
        stack.push(...node.rules.reverse()); // Push at-rule child rules in reverse order
      }
    }
  }

  private parseAtRule(): AtRule {
    const token = this.advance(); // Consume the atRule token
    if (token.type !== 'atRule') {
      throw new Error(`Expected atRule token, but got "${token.type}".`);
    }

    const name = token.name!;
    const params = token.params!;

    // Bodyless at-rule: Look for a semicolon
    if (this.check('semicolon')) {
      this.consume('semicolon');
      return {
        type: 'at-rule',
        name,
        params,
      };
    }

    // At-rule with a block
    const rules: (Rule | AtRule)[] = [];
    if (this.check('block-start')) {
      this.consume('block-start');
      while (!this.check('block-end') && !this.isAtEnd()) {
        if (this.peek()?.type === 'atRule') {
          rules.push(this.parseAtRule());
        } else {
          rules.push(this.parseRule());
        }
      }
      if (this.check('block-end')) {
        this.consume('block-end');
      }
    }

    return {
      type: 'at-rule',
      name,
      params,
      rules: rules.length > 0 ? rules : undefined,
    };
  }

  private parseRule(): Rule {
    const selectors = this.readUntil('block-start')
      .split(',')
      .map((s) => s.trim());
    this.consume('block-start');

    const declarations: Declaration[] = [];
    const nestedRules: Rule[] = [];

    while (!this.check('block-end') && !this.isAtEnd()) {
      const nextToken = this.peek();
      if (nextToken?.type === 'text' && nextToken.value.startsWith('&')) {
        const nestedRule = this.parseRule();
        if (nestedRule) nestedRules.push(nestedRule);
      } else {
        const declaration = this.parseDeclaration();
        if (declaration) declarations.push(declaration);
      }
    }

    if (this.check('block-end')) {
      this.consume('block-end');
    }

    return {
      type: 'rule',
      selectors,
      declarations,
      nestedRules: nestedRules.length > 0 ? nestedRules : undefined,
    };
  }

  private parseDeclaration(): Declaration | null {
    const property = this.readUntil('colon').trim();
    if (!this.check('colon')) return null;
    this.consume('colon');

    const value = this.readUntil('semicolon', 'block-end').trim();
    if (this.check('semicolon')) this.consume('semicolon');

    return { property, value };
  }

  private readUntil(...types: Token['type'][]): string {
    let result = '';
    while (
      !this.isAtEnd() &&
      this.peek() &&
      !types.includes(this.peek()!.type)
    ) {
      result += this.advance().value;
    }
    return result;
  }

  private advance(): Token {
    return this.tokens[this.current++];
  }

  private consume(expectedType: Token['type']): void {
    if (this.check(expectedType)) {
      this.advance();
    } else {
      throw new Error(
        `Expected token type "${expectedType}", but got "${this.peek()?.type}".`,
      );
    }
  }

  private check(type: Token['type']): boolean {
    return this.peek()?.type === type;
  }

  private peek(): Token | null {
    return this.tokens[this.current] || null;
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length;
  }
}
