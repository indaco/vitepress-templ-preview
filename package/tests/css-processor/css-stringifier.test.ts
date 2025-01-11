import { describe, it, expect, beforeEach } from 'vitest';
import { CssTokenizer } from '../../src/plugin/css-processor/css-tokenizer';
import { CssStringifier } from '../../src/plugin/css-processor/css-stringifier';

describe('CssStringifiers', () => {
  let tokenizer: CssTokenizer;

  beforeEach(() => {
    tokenizer = new CssTokenizer();
  });

  it('should pretty print simple CSS rule', () => {
    const css = `body { color: red; }`;

    const tokens = tokenizer.tokenize(css);

    const rawCss = CssStringifier.prettyPrint(tokens);
    expect(rawCss).toEqual(
      `
body {
  color: red;
}
`.trim(),
    );
  });

  it('should minify the css string', () => {
    const css = 'body { color: red; } h1 { font-size: 2rem; }';
    const tokens = tokenizer.tokenize(css);

    const rawCss = CssStringifier.minify(tokens);
    expect(rawCss).toEqual(`body{color:red;}h1{font-size:2rem;}`);
  });

  it('should minify with serializeTokens', () => {
    const css = '@layer base { h1 { font-size: 2rem; } }';
    const tokens = tokenizer.tokenize(css);

    const rawCss = CssStringifier.serializeTokens(tokens);
    const expectedRawCss = `
@layer base {
  h1 {
    font-size: 2rem;
  }
}`;
    expect(rawCss).toEqual(expectedRawCss.trim());

    const minifiedRawCss = CssStringifier.serializeTokens(tokens, true);
    expect(minifiedRawCss).toEqual('@layer base{h1{font-size:2rem;}}');
  });

  it('should pretty print with serializeTokens', () => {
    const css = `
      @import url('styles.css');
      @media (min-width: 600px) {
        h1 { font-size: 2rem; }
      }
    `;
    const tokens = tokenizer.tokenize(css);

    const rawCss = CssStringifier.serializeTokens(tokens);
    expect(rawCss).toEqual(
      `
@import url(styles.css)

@media (min-width:600px) {
  h1 {
    font-size: 2rem;
  }
}`.trim(),
    );
  });

  it('should properly pretty print nested pseudo-classes and pseudo-elements', () => {
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
    const tokens = tokenizer.tokenize(css);

    const rawCss = CssStringifier.prettyPrint(tokens);
    expect(rawCss).toEqual(css.replaceAll("'", '"').trim());
  });

  it('should properly pretty print nested rules with multiple selectors', () => {
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
    const tokens = tokenizer.tokenize(css);

    const rawCss = CssStringifier.prettyPrint(tokens);
    expect(rawCss).toEqual(css.trim().replaceAll("'", '"'));
  });

  it('should pretty print CSS rules, at-rules, identifiers and discard comments', () => {
    const css = `
body { color: red; }

@layer reset { *, *:before, *:after { margin:0;}}

/* A comment */
#id:has(> .child) {
    background-color: blue;
}
`;

    const tokens = tokenizer.tokenize(css);
    expect(tokens.length).toBe(3);

    const rawCss = CssStringifier.prettyPrint(tokens);
    expect(rawCss).toEqual(
      `
body {
  color: red;
}

@layer reset {
  *, *:before, *:after {
    margin: 0;
  }
}

#id:has(>.child) {
  background-color: blue;
}
`.trim(),
    );
  });
});
