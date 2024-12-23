import { describe, it, expect } from 'vitest';
import { CssTokenizer } from '../src/css-tokenizer';

describe('CssTokenizer', () => {
  it('should tokenize simple CSS rule', () => {
    const css = 'body { color: red; }';
    const tokenizer = new CssTokenizer(css);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: 'text', value: 'body' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'color' },
      { type: 'colon', value: ':' },
      { type: 'text', value: 'red' },
      { type: 'semicolon', value: ';' },
      { type: 'block-end', value: '}' },
    ]);
  });

  it('should tokenize multiple rules', () => {
    const css = 'body { color: red; } h1 { font-size: 2rem; }';
    const tokenizer = new CssTokenizer(css);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: 'text', value: 'body' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'color' },
      { type: 'colon', value: ':' },
      { type: 'text', value: 'red' },
      { type: 'semicolon', value: ';' },
      { type: 'block-end', value: '}' },
      { type: 'text', value: 'h1' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'font-size' },
      { type: 'colon', value: ':' },
      { type: 'text', value: '2rem' },
      { type: 'semicolon', value: ';' },
      { type: 'block-end', value: '}' },
    ]);
  });

  it('should handle @layer rules', () => {
    const css = '@layer base { h1 { font-size: 2rem; } }';
    const tokenizer = new CssTokenizer(css);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: 'atRule', value: '@layer', name: 'layer', params: 'base' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'h1' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'font-size' },
      { type: 'colon', value: ':' },
      { type: 'text', value: '2rem' },
      { type: 'semicolon', value: ';' },
      { type: 'block-end', value: '}' },
      { type: 'block-end', value: '}' },
    ]);
  });

  it('should handle @media queries', () => {
    const css = '@media (max-width: 600px) { .container { display: none; } }';
    const tokenizer = new CssTokenizer(css);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      {
        type: 'atRule',
        value: '@media',
        name: 'media',
        params: '(max-width: 600px)',
      },
      { type: 'block-start', value: '{' },
      { type: 'text', value: '.container' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'display' },
      { type: 'colon', value: ':' },
      { type: 'text', value: 'none' },
      { type: 'semicolon', value: ';' },
      { type: 'block-end', value: '}' },
      { type: 'block-end', value: '}' },
    ]);
  });

  it('should handle multiple at-rules', () => {
    const css = `
      @import url('styles.css');
      @media (min-width: 600px) {
        h1 { font-size: 2rem; }
      }
    `;
    const tokenizer = new CssTokenizer(css);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      {
        type: 'atRule',
        value: '@import',
        name: 'import',
        params: "url('styles.css')",
      },
      { type: 'semicolon', value: ';' },
      {
        type: 'atRule',
        value: '@media',
        name: 'media',
        params: '(min-width: 600px)',
      },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'h1' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'font-size' },
      { type: 'colon', value: ':' },
      { type: 'text', value: '2rem' },
      { type: 'semicolon', value: ';' },
      { type: 'block-end', value: '}' },
      { type: 'block-end', value: '}' },
    ]);
  });

  it('should handle nested rules', () => {
    const css = 'a { color: blue; &:hover { color: red; } }';
    const tokenizer = new CssTokenizer(css);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: 'text', value: 'a' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'color' },
      { type: 'colon', value: ':' },
      { type: 'text', value: 'blue' },
      { type: 'semicolon', value: ';' },
      { type: 'text', value: '&:hover' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'color' },
      { type: 'colon', value: ':' },
      { type: 'text', value: 'red' },
      { type: 'semicolon', value: ';' },
      { type: 'block-end', value: '}' },
      { type: 'block-end', value: '}' },
    ]);
  });

  it('should handle nested pseudo-classes and pseudo-elements', () => {
    const css = `
    a {
      color: blue;
      &:hover {
        color: red;
      }
      &:focus-within {
        outline: none;
      }
      &:before {
        content: '';
      }
    }
  `;
    const tokenizer = new CssTokenizer(css);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: 'text', value: 'a' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'color' },
      { type: 'colon', value: ':' },
      { type: 'text', value: 'blue' },
      { type: 'semicolon', value: ';' },
      { type: 'text', value: '&:hover' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'color' },
      { type: 'colon', value: ':' },
      { type: 'text', value: 'red' },
      { type: 'semicolon', value: ';' },
      { type: 'block-end', value: '}' },
      { type: 'text', value: '&:focus-within' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'outline' },
      { type: 'colon', value: ':' },
      { type: 'text', value: 'none' },
      { type: 'semicolon', value: ';' },
      { type: 'block-end', value: '}' },
      { type: 'text', value: '&:before' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'content' },
      { type: 'colon', value: ':' },
      { type: 'text', value: "''" },
      { type: 'semicolon', value: ';' },
      { type: 'block-end', value: '}' },
      { type: 'block-end', value: '}' },
    ]);
  });

  it('should handle nested rules with multiple selectors', () => {
    const css = `
    button {
      background: green;
      &:disabled {
        opacity: 0.5;
      }
      &:not(:disabled) {
        background: blue;
      }
      &:after {
        content: '!';
      }
    }
  `;
    const tokenizer = new CssTokenizer(css);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: 'text', value: 'button' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'background' },
      { type: 'colon', value: ':' },
      { type: 'text', value: 'green' },
      { type: 'semicolon', value: ';' },
      { type: 'text', value: '&:disabled' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'opacity' },
      { type: 'colon', value: ':' },
      { type: 'text', value: '0.5' },
      { type: 'semicolon', value: ';' },
      { type: 'block-end', value: '}' },
      { type: 'text', value: '&:not(:disabled)' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'background' },
      { type: 'colon', value: ':' },
      { type: 'text', value: 'blue' },
      { type: 'semicolon', value: ';' },
      { type: 'block-end', value: '}' },
      { type: 'text', value: '&:after' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'content' },
      { type: 'colon', value: ':' },
      { type: 'text', value: "'!'" },
      { type: 'semicolon', value: ';' },
      { type: 'block-end', value: '}' },
      { type: 'block-end', value: '}' },
    ]);
  });

  it('should handle malformed CSS gracefully', () => {
    const css = 'body { color: red; font-size }';
    const tokenizer = new CssTokenizer(css);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: 'text', value: 'body' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'color' },
      { type: 'colon', value: ':' },
      { type: 'text', value: 'red' },
      { type: 'semicolon', value: ';' },
      { type: 'text', value: 'font-size' },
      { type: 'block-end', value: '}' },
    ]);
  });

  it('should skip whitespace', () => {
    const css = '  body  {  color  :  red  ;  }  ';
    const tokenizer = new CssTokenizer(css);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([
      { type: 'text', value: 'body' },
      { type: 'block-start', value: '{' },
      { type: 'text', value: 'color' },
      { type: 'colon', value: ':' },
      { type: 'text', value: 'red' },
      { type: 'semicolon', value: ';' },
      { type: 'block-end', value: '}' },
    ]);
  });

  it('should handle empty CSS gracefully', () => {
    const css = '';
    const tokenizer = new CssTokenizer(css);
    const tokens = tokenizer.tokenize();

    expect(tokens).toEqual([]);
  });
});
