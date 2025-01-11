import { describe, it, expect, beforeEach } from 'vitest';
import { CssTokenizer } from '../../src/plugin/css-processor/css-tokenizer';

describe('CssTokenizer', () => {
  let tokenizer: CssTokenizer;

  beforeEach(() => {
    tokenizer = new CssTokenizer();
  });

  describe('Valid Inputs', () => {
    it('should tokenize simple CSS rule', () => {
      const css = 'body { color: red; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens.length).toBe(1);
      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'body',
          details: { selector: 'body' },
          children: [
            {
              type: 'declaration',
              value: 'color: red;',
              details: { property: 'color', value: 'red' },
              children: [],
            },
          ],
        },
      ]);
    });

    it('should tokenize multiple rules and minify the output string', () => {
      const css = 'body { color: red; } h1 { font-size: 2rem; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens.length).toBe(2);
      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'body',
          details: { selector: 'body' },
          children: [
            {
              type: 'declaration',
              value: 'color: red;',
              details: { property: 'color', value: 'red' },
              children: [],
            },
          ],
        },
        {
          type: 'rule',
          value: 'h1',
          details: { selector: 'h1' },
          children: [
            {
              type: 'declaration',
              value: 'font-size: 2rem;',
              details: { property: 'font-size', value: '2rem' },
              children: [],
            },
          ],
        },
      ]);
    });

    it('should handle @layer rules', () => {
      const css = '@layer base { h1 { font-size: 2rem; } }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'at-rule',
          value: '@layer base',
          details: { name: 'layer', prelude: 'base' },
          children: [
            {
              type: 'rule',
              value: 'h1',
              details: { selector: 'h1' },
              children: [
                {
                  type: 'declaration',
                  value: 'font-size: 2rem;',
                  details: { property: 'font-size', value: '2rem' },
                  children: [],
                },
              ],
            },
          ],
        },
      ]);
    });

    it('should parse @layer with multiple names', () => {
      const css = '@layer reset,base,components,utilities;';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'at-rule',
          value: '@layer reset,base,components,utilities',
          details: {
            name: 'layer',
            prelude: 'reset,base,components,utilities',
          },
          children: [],
        },
      ]);
    });

    it('should handle @media queries', () => {
      const css = '@media (max-width: 600px) { .container { display: none; } }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'at-rule',
          value: '@media (max-width:600px)',
          details: { name: 'media', prelude: '(max-width:600px)' },
          children: [
            {
              type: 'rule',
              value: '.container',
              details: { selector: '.container' },
              children: [
                {
                  type: 'declaration',
                  value: 'display: none;',
                  details: { property: 'display', value: 'none' },
                  children: [],
                },
              ],
            },
          ],
        },
      ]);
    });

    it('should handle multiple at-rules', () => {
      const css = `
      @import url('styles.css');
      @media (min-width: 600px) {
        h1 { font-size: 2rem; }
      }
    `;
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'at-rule',
          value: '@import url(styles.css)',
          details: { name: 'import', prelude: 'url(styles.css)' },
          children: [],
        },
        {
          type: 'at-rule',
          value: '@media (min-width:600px)',
          details: { name: 'media', prelude: '(min-width:600px)' },
          children: [
            {
              type: 'rule',
              value: 'h1',
              details: { selector: 'h1' },
              children: [
                {
                  type: 'declaration',
                  value: 'font-size: 2rem;',
                  details: { property: 'font-size', value: '2rem' },
                  children: [],
                },
              ],
            },
          ],
        },
      ]);
    });
  });

  describe('Invalid CSS', () => {
    it('should handle malformed pseudo-class selectors gracefully', () => {
      const css = 'button:not(:hover { background: yellow; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([]);
    });

    it('should handle malformed :is pseudo-class', () => {
      const css = 'a:is(h1, { color: red; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([]);
    });

    it('should handle malformed :has pseudo-class', () => {
      const css = 'div:has(> { background: yellow; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([]);
    });
  });

  describe('Nested Rules', () => {
    it('should handle nested rules', () => {
      const css = 'a { color: blue; &:hover { color: red; } }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'a',
          details: { selector: 'a' },
          children: [
            {
              type: 'declaration',
              value: 'color: blue;',
              details: { property: 'color', value: 'blue' },
              children: [],
            },
            {
              type: 'rule',
              value: '&:hover',
              details: { selector: '&:hover' },
              children: [
                {
                  type: 'declaration',
                  value: 'color: red;',
                  details: { property: 'color', value: 'red' },
                  children: [],
                },
              ],
            },
          ],
        },
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
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'a',
          details: { selector: 'a' },
          children: [
            {
              type: 'declaration',
              value: 'color: blue;',
              details: { property: 'color', value: 'blue' },
              children: [],
            },
            {
              type: 'rule',
              value: '&:hover',
              details: { selector: '&:hover' },
              children: [
                {
                  type: 'declaration',
                  value: 'color: red;',
                  details: { property: 'color', value: 'red' },
                  children: [],
                },
              ],
            },
            {
              type: 'rule',
              value: '&:focus-within',
              details: { selector: '&:focus-within' },
              children: [
                {
                  type: 'declaration',
                  value: 'outline: none;',
                  details: { property: 'outline', value: 'none' },
                  children: [],
                },
              ],
            },
            {
              type: 'rule',
              value: '&:before',
              details: { selector: '&:before' },
              children: [
                {
                  type: 'declaration',
                  value: 'content: "";',
                  details: { property: 'content', value: '""' },
                  children: [],
                },
              ],
            },
          ],
        },
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
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'button',
          details: { selector: 'button' },
          children: [
            {
              type: 'declaration',
              value: 'background: green;',
              details: { property: 'background', value: 'green' },
              children: [],
            },
            {
              type: 'rule',
              value: '&:disabled',
              details: { selector: '&:disabled' },
              children: [
                {
                  type: 'declaration',
                  value: 'opacity: 0.5;',
                  details: { property: 'opacity', value: '0.5' },
                  children: [],
                },
              ],
            },
            {
              type: 'rule',
              value: '&:not(:disabled)',
              details: { selector: '&:not(:disabled)' },
              children: [
                {
                  type: 'declaration',
                  value: 'background: blue;',
                  details: { property: 'background', value: 'blue' },
                  children: [],
                },
              ],
            },
            {
              type: 'rule',
              value: '&:after',
              details: { selector: '&:after' },
              children: [
                {
                  type: 'declaration',
                  value: 'content: "!";',
                  details: { property: 'content', value: '"!"' },
                  children: [],
                },
              ],
            },
          ],
        },
      ]);
    });
  });

  describe('Pseudo-classes, pseudo-elements and selectors', () => {
    it('should tokenize CSS rules, at-rules, identifiers and discard comments', () => {
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
    });

    it('should tokenize pseudo-class :hover', () => {
      const css = 'button:hover { background: blue; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'button:hover',
          details: { selector: 'button:hover' },
          children: [
            {
              type: 'declaration',
              value: 'background: blue;',
              details: { property: 'background', value: 'blue' },
              children: [],
            },
          ],
        },
      ]);
    });

    it('should handle multiple selectors in a rule', () => {
      const css = `
        #id1, .class2:hover {
          background-color: blue;
        }
      `;
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: '#id1, .class2:hover',
          details: { selector: '#id1, .class2:hover' },
          children: [
            {
              type: 'declaration',
              value: 'background-color: blue;',
              details: { property: 'background-color', value: 'blue' },
              children: [],
            },
          ],
        },
      ]);
    });

    it('should tokenize function :not with arguments', () => {
      const css = 'button:not(:disabled) { background: green; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'button:not(:disabled)',
          details: { selector: 'button:not(:disabled)' },
          children: [
            {
              type: 'declaration',
              value: 'background: green;',
              details: { property: 'background', value: 'green' },
              children: [],
            },
          ],
        },
      ]);
    });

    it('should tokenize pseudo-class :nth-child', () => {
      const css = 'li:nth-child(2n) { color: red; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'li:nth-child(2n)',
          details: { selector: 'li:nth-child(2n)' },
          children: [
            {
              type: 'declaration',
              value: 'color: red;',
              details: { property: 'color', value: 'red' },
              children: [],
            },
          ],
        },
      ]);
    });

    it('should tokenize pseudo-class :first-of-type', () => {
      const css = 'p:first-of-type { font-weight: bold; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'p:first-of-type',
          details: { selector: 'p:first-of-type' },
          children: [
            {
              type: 'declaration',
              value: 'font-weight: bold;',
              details: { property: 'font-weight', value: 'bold' },
              children: [],
            },
          ],
        },
      ]);
    });

    it('should tokenize pseudo-class :where with multiple selectors', () => {
      const css = ':where(h1, h2, h3) { margin: 0; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: ':where(h1, h2, h3)',
          details: { selector: ':where(h1, h2, h3)' },
          children: [
            {
              type: 'declaration',
              value: 'margin: 0;',
              details: { property: 'margin', value: '0' },
              children: [],
            },
          ],
        },
      ]);
    });

    it('should tokenize pseudo-class with SCSS-like nested selectors', () => {
      const css = `
        .container {
          &:hover {
            background: yellow;
          }
          &:not(.active) {
            opacity: 0.5;
          }
        }
      `;
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: '.container',
          details: { selector: '.container' },
          children: [
            {
              type: 'rule',
              value: '&:hover',
              details: { selector: '&:hover' },
              children: [
                {
                  type: 'declaration',
                  value: 'background: yellow;',
                  details: { property: 'background', value: 'yellow' },
                  children: [],
                },
              ],
            },
            {
              type: 'rule',
              value: '&:not(.active)',
              details: { selector: '&:not(.active)' },
              children: [
                {
                  type: 'declaration',
                  value: 'opacity: 0.5;',
                  details: { property: 'opacity', value: '0.5' },
                  children: [],
                },
              ],
            },
          ],
        },
      ]);
    });

    it('should handle multiple pseudo-classes in a single selector', () => {
      const css = 'a:focus:hover { text-decoration: underline; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'a:focus:hover',
          details: { selector: 'a:focus:hover' },
          children: [
            {
              type: 'declaration',
              value: 'text-decoration: underline;',
              details: { property: 'text-decoration', value: 'underline' },
              children: [],
            },
          ],
        },
      ]);
    });

    it('should tokenize :is pseudo-class with single selector', () => {
      const css = 'a:is(h1) { color: red; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'a:is(h1)',
          details: { selector: 'a:is(h1)' },
          children: [
            {
              type: 'declaration',
              value: 'color: red;',
              details: { property: 'color', value: 'red' },
              children: [],
            },
          ],
        },
      ]);
    });

    it('should tokenize :is pseudo-class with multiple selectors', () => {
      const css = 'a:is(h1, h2, h3) { margin: 0; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'a:is(h1, h2, h3)',
          details: { selector: 'a:is(h1, h2, h3)' },
          children: [
            {
              type: 'declaration',
              value: 'margin: 0;',
              details: { property: 'margin', value: '0' },
              children: [],
            },
          ],
        },
      ]);
    });

    it('should tokenize :has pseudo-class with direct child selector', () => {
      const css = 'div:has(> p) { padding: 1rem; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'div:has(>p)',
          details: { selector: 'div:has(>p)' },
          children: [
            {
              type: 'declaration',
              value: 'padding: 1rem;',
              details: { property: 'padding', value: '1rem' },
              children: [],
            },
          ],
        },
      ]);
    });

    it('should tokenize :has pseudo-class with multiple child selectors', () => {
      const css = 'section:has(h1, h2) { background: blue; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'section:has(h1, h2)',
          details: { selector: 'section:has(h1, h2)' },
          children: [
            {
              type: 'declaration',
              value: 'background: blue;',
              details: { property: 'background', value: 'blue' },
              children: [],
            },
          ],
        },
      ]);
    });

    it('should handle nested :is within :has', () => {
      const css = 'div:has(:is(h1, h2)) { border: 1px solid black; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'div:has(:is(h1, h2))',
          details: { selector: 'div:has(:is(h1, h2))' },
          children: [
            {
              type: 'declaration',
              value: 'border: 1px solid black;',
              details: { property: 'border', value: '1px solid black' },
              children: [],
            },
          ],
        },
      ]);
    });

    it('should handle :is pseudo-class with combinators', () => {
      const css = 'a:is(h1 > p) { text-align: center; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'a:is(h1>p)',
          details: { selector: 'a:is(h1>p)' },
          children: [
            {
              type: 'declaration',
              value: 'text-align: center;',
              details: { property: 'text-align', value: 'center' },
              children: [],
            },
          ],
        },
      ]);
    });

    it('should handle :has pseudo-class with complex selectors', () => {
      const css = 'div:has(> a:hover) { outline: none; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'div:has(>a:hover)',
          details: { selector: 'div:has(>a:hover)' },
          children: [
            {
              type: 'declaration',
              value: 'outline: none;',
              details: { property: 'outline', value: 'none' },
              children: [],
            },
          ],
        },
      ]);
    });

    it('should tokenize :is and :has together', () => {
      const css = 'section:has(:is(h1, h2, h3)) { font-size: large; }';
      const tokens = tokenizer.tokenize(css);

      expect(tokens).toEqual([
        {
          type: 'rule',
          value: 'section:has(:is(h1, h2, h3))',
          details: { selector: 'section:has(:is(h1, h2, h3))' },
          children: [
            {
              type: 'declaration',
              value: 'font-size: large;',
              details: { property: 'font-size', value: 'large' },
              children: [],
            },
          ],
        },
      ]);
    });

    it('should handle multiple classes in a mixed way', () => {
      const css = `
      @layer base {
            .class1 { color: red; }
            .class2 { color: blue; }
          }
          .class3 { color: green; }
      `;
      const tokens = tokenizer.tokenize(css);

      expect(tokens.length).toBe(2);
      expect(tokens).toEqual([
        {
          type: 'at-rule',
          value: '@layer base',
          details: { name: 'layer', prelude: 'base' },
          children: [
            {
              type: 'rule',
              value: '.class1',
              details: { selector: '.class1' },
              children: [
                {
                  type: 'declaration',
                  value: 'color: red;',
                  details: { property: 'color', value: 'red' },
                  children: [],
                },
              ],
            },
            {
              type: 'rule',
              value: '.class2',
              details: { selector: '.class2' },
              children: [
                {
                  type: 'declaration',
                  value: 'color: blue;',
                  details: { property: 'color', value: 'blue' },
                  children: [],
                },
              ],
            },
          ],
        },
        {
          type: 'rule',
          value: '.class3',
          details: { selector: '.class3' },
          children: [
            {
              type: 'declaration',
              value: 'color: green;',
              details: { property: 'color', value: 'green' },
              children: [],
            },
          ],
        },
      ]);
    });
  });

  describe('Complex CSS', () => {
    it('should properly tokenize minified css string with layer declararions and definitions', () => {
      const css = `@layer reset,base,components,utilities;@layer reset{*,*:before,*:after{box-sizing:border-box;border:0;border-style:solid}}@layer base{:root{--hs-c-white: 1 0 0;--hs-c-black: 0 0 0;--hs-transparent: oklch(0 0 0 / 0);--hs-opacity: 1;--hs-font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--hs-font-serif: ui-serif, georgia, cambria, "Times New Roman", times, serif;--hs-font-mono: ui-monospace, sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace}}`;

      const tokens = tokenizer.tokenize(css);

      //const rawCss = CssStringifier.serializeTokens(tokens);
      expect(tokens.length).toEqual(3);

      expect(tokens[0].children.length).toEqual(0); // @layer reset
      expect(tokens[1].children[0].children.length).toEqual(3); // @layer reset children
      expect(tokens[2].value).toBe('@layer base');
    });

    it('should tokenize long CSS', () => {
      const css = `
      @layer reset,base,components,utilities;
      @layer reset {
        *, *:before, *:after {
          box-sizing: border-box;
          border: 0;
          border-style: solid;
        }
      }
      @layer base {
        :root {
          --hs-c-white: 1 0 0;
          --hs-c-black: 0 0 0;
          --hs-transparent: oklch(0 0 0 / 0);
          --hs-opacity: 1;
          --hs-font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
          --hs-font-serif: ui-serif, georgia, cambria, "Times New Roman", times, serif;
          --hs-font-mono: ui-monospace, sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace;
        }
        .hans :is(blockquote, dl, dd, h1, h2, h3, h4, h5, h6, figure, p, pre) {
          margin: 0;
        }
        .hans :is(h1, h2, h3, h4, h5, h6, p) {
          overflow-wrap: break-word;
        }
      }
      @layer utilities {
        .sronly {
          position: absolute;
          overflow: hidden;
          width: 1px;
          height: 1px;
          margin: -1px;
          padding: 0;
          white-space: nowrap;
          clip: rect(0, 0, 0, 0);
          border-width: 0;
        }
      }
    `;

      const tokens = tokenizer.tokenize(css);

      // Perform basic validation
      expect(tokens).toBeDefined();
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens.length).toEqual(4);

      // Ensure @layer tokens are correctly captured
      const atLayerTokens = tokens.filter(
        (token) => token.type === 'at-rule' && token.value.includes('@layer'),
      );
      expect(atLayerTokens.length).toBe(4);

      // Validate the first @layer rule (@layer reset, base, components, utilities)
      const firstAtLayer = atLayerTokens[0];
      expect(firstAtLayer.type).toBe('at-rule');
      expect(firstAtLayer.value).toContain('@layer');

      // Check if the tokenizing handles properties under :root in @layer base
      const rootSelectorToken = tokens[2].children.find(
        (token) => token.type === 'rule' && token.value === ':root',
      );
      expect(rootSelectorToken).toBeDefined();

      const hsCWhiteToken = rootSelectorToken?.children.find(
        (token) =>
          token.type === 'declaration' && token.value.includes('--hs-c-white'),
      );
      expect(hsCWhiteToken).toBeDefined();

      // Check the complex CSS variables being parsed
      const hsFontSansToken = rootSelectorToken?.children.find(
        (token) =>
          token.type === 'declaration' &&
          token.value.includes('--hs-font-sans'),
      );
      expect(hsFontSansToken).toBeDefined();

      const srOnlyPositionToken = tokens.find(
        (token) =>
          token.type === 'at-rule' && token.value === '@layer utilities',
      )?.children[0];
      expect(srOnlyPositionToken).toBeDefined();
    });

    it('should handle pseudo-classes and selectors', () => {
      const css = `.main-class :is(blockquote, dl, dd, h1, h2, h3, h4, h5, h6, figure, p, pre) { margin: 0 }
.main-class :is(h1, h2, h3, h4, h5, h6, p) { overflow-wrap: break-word }
.main-class :is(h1, h2, h3, h4, h5, h6) { word-break: break-word; text-wrap: balance }
.main-class a { text-decoration: none }
.main-class li+li { margin-top: 0 }`;

      const tokens = tokenizer.tokenize(css);

      expect(tokens.length).toBe(5);
      expect(tokens).toEqual([
        {
          type: 'rule',
          value:
            '.main-class :is(blockquote, dl, dd, h1, h2, h3, h4, h5, h6, figure, p, pre)',
          details: {
            selector:
              '.main-class :is(blockquote, dl, dd, h1, h2, h3, h4, h5, h6, figure, p, pre)',
          },
          children: [
            {
              type: 'declaration',
              value: 'margin: 0;',
              details: { property: 'margin', value: '0' },
              children: [],
            },
          ],
        },
        {
          type: 'rule',
          value: '.main-class :is(h1, h2, h3, h4, h5, h6, p)',
          details: { selector: '.main-class :is(h1, h2, h3, h4, h5, h6, p)' },
          children: [
            {
              type: 'declaration',
              value: 'overflow-wrap: break-word;',
              details: { property: 'overflow-wrap', value: 'break-word' },
              children: [],
            },
          ],
        },
        {
          type: 'rule',
          value: '.main-class :is(h1, h2, h3, h4, h5, h6)',
          details: { selector: '.main-class :is(h1, h2, h3, h4, h5, h6)' },
          children: [
            {
              type: 'declaration',
              value: 'word-break: break-word;',
              details: { property: 'word-break', value: 'break-word' },
              children: [],
            },
            {
              type: 'declaration',
              value: 'text-wrap: balance;',
              details: { property: 'text-wrap', value: 'balance' },
              children: [],
            },
          ],
        },
        {
          type: 'rule',
          value: '.main-class a',
          details: { selector: '.main-class a' },
          children: [
            {
              type: 'declaration',
              value: 'text-decoration: none;',
              details: { property: 'text-decoration', value: 'none' },
              children: [],
            },
          ],
        },
        {
          type: 'rule',
          value: '.main-class li+li',
          details: { selector: '.main-class li+li' },
          children: [
            {
              type: 'declaration',
              value: 'margin-top: 0;',
              details: { property: 'margin-top', value: '0' },
              children: [],
            },
          ],
        },
      ]);
    });
  });
});
