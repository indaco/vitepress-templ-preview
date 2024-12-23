import { describe, it, expect } from 'vitest';
import { CssAstParser } from '../src/css-ast-parser';

describe('CssAstParser', () => {
  it('should parse simple CSS rules', () => {
    const css = 'body { color: red; background: white; }';
    const parser = new CssAstParser(css);
    const ast = parser.parse();

    expect(ast).toEqual([
      {
        type: 'rule',
        selectors: ['body'],
        declarations: [
          { property: 'color', value: 'red' },
          { property: 'background', value: 'white' },
        ],
      },
    ]);
  });

  it('should parse multiple rules', () => {
    const css = 'h1 { font-size: 2rem; } p { margin: 0; }';
    const parser = new CssAstParser(css);
    const ast = parser.parse();

    expect(ast).toEqual([
      {
        type: 'rule',
        selectors: ['h1'],
        declarations: [{ property: 'font-size', value: '2rem' }],
      },
      {
        type: 'rule',
        selectors: ['p'],
        declarations: [{ property: 'margin', value: '0' }],
      },
    ]);
  });

  it('should parse @layer rules', () => {
    const css = '@layer base { h1 { font-size: 2rem; } }';
    const parser = new CssAstParser(css);
    const ast = parser.parse();

    expect(ast).toEqual([
      {
        type: 'at-rule',
        name: 'layer',
        params: 'base',
        rules: [
          {
            type: 'rule',
            selectors: ['h1'],
            declarations: [{ property: 'font-size', value: '2rem' }],
          },
        ],
      },
    ]);
  });

  it('should parse @media queries', () => {
    const css = '@media (max-width: 600px) { body { font-size: 12px; } }';
    const parser = new CssAstParser(css);
    const ast = parser.parse();

    expect(ast).toEqual([
      {
        type: 'at-rule',
        name: 'media',
        params: '(max-width: 600px)',
        rules: [
          {
            type: 'rule',
            selectors: ['body'],
            declarations: [{ property: 'font-size', value: '12px' }],
          },
        ],
      },
    ]);
  });

  it('should parse multiple at-rules', () => {
    const css = `
    @import url('styles.css');
    @media (min-width: 600px) {
      h1 { font-size: 2rem; }
    }
  `;
    const parser = new CssAstParser(css);
    const ast = parser.parse();

    expect(ast).toEqual([
      {
        type: 'at-rule',
        name: 'import',
        params: "url('styles.css')",
      },
      {
        type: 'at-rule',
        name: 'media',
        params: '(min-width: 600px)',
        rules: [
          {
            type: 'rule',
            selectors: ['h1'],
            declarations: [{ property: 'font-size', value: '2rem' }],
          },
        ],
      },
    ]);
  });

  it('should parse nested rules', () => {
    const css = 'a { color: blue; &:hover { color: red; } }';
    const parser = new CssAstParser(css);
    const ast = parser.parse();

    expect(ast).toEqual([
      {
        type: 'rule',
        selectors: ['a'],
        declarations: [{ property: 'color', value: 'blue' }],
        nestedRules: [
          {
            type: 'rule',
            selectors: ['&:hover'],
            declarations: [{ property: 'color', value: 'red' }],
          },
        ],
      },
    ]);
  });

  it('should handle malformed CSS gracefully', () => {
    const css = 'body { color: red; font-size }';
    const parser = new CssAstParser(css);
    const ast = parser.parse();

    expect(ast).toEqual([
      {
        type: 'rule',
        selectors: ['body'],
        declarations: [{ property: 'color', value: 'red' }],
      },
    ]);
  });

  it('should handle empty CSS gracefully', () => {
    const css = '';
    const parser = new CssAstParser(css);
    const ast = parser.parse();

    expect(ast).toEqual([]);
  });

  it('should parse complex nested rules', () => {
    const css = `
      button {
        background: green;
        &:hover {
          background: blue;
        }
        &:disabled {
          opacity: 0.5;
        }
      }
    `;
    const parser = new CssAstParser(css);
    const ast = parser.parse();

    expect(ast).toEqual([
      {
        type: 'rule',
        selectors: ['button'],
        declarations: [{ property: 'background', value: 'green' }],
        nestedRules: [
          {
            type: 'rule',
            selectors: ['&:hover'],
            declarations: [{ property: 'background', value: 'blue' }],
          },
          {
            type: 'rule',
            selectors: ['&:disabled'],
            declarations: [{ property: 'opacity', value: '0.5' }],
          },
        ],
      },
    ]);
  });

  it('should walk through all rules using walkRules', () => {
    const css = `
      button {
        background: green;
        &:hover {
          background: blue;
        }
      }
      a {
        color: red;
      }
    `;
    const parser = new CssAstParser(css);
    const ast = parser.parse();

    const rules: string[] = [];
    parser.walkRules(ast, (rule) => {
      rules.push(...rule.selectors);
    });

    expect(rules).toEqual(['button', '&:hover', 'a']);
  });
});
