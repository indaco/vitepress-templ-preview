import { describe, it, expect, beforeEach } from 'vitest';
import {
  CssTokenizer,
  Token,
} from '../../src/internals/css-processor/css-tokenizer';
import { CssTokenProcessor } from '../../src/internals/css-processor/css-token-processor';
import { LayerProcessor } from '../../src/internals/css-processor/strategies/layer-processor';
import { TokenProcessorStrategyOptions } from '../../src/internals/css-processor/strategies/token-processor-strategy';

describe('CssTokenProcessor', () => {
  it('should throw an error when execute is called without a strategy set', () => {
    // Arrange
    const processor = new CssTokenProcessor();
    const tokens: Token[] = []; // Example token array, can be empty for this test.

    // Act & Assert
    expect(() => {
      processor.execute(tokens);
    }).toThrowError('No strategy set. Please add at least one strategy.');
  });

  it('should throw an error when execute is called without a strategy set', () => {
    // Arrange
    const processor = new CssTokenProcessor();
    processor.addStrategy(new LayerProcessor());
    const tokens: Token[] = []; // Example token array, can be empty for this test.
    const result = processor.execute(tokens);

    // Act & Assert
    expect(result).toEqual([]);
  });

  it('should correctly set and merge options', () => {
    const strategy = new LayerProcessor();
    const processor = new CssTokenProcessor([strategy]);

    const newOptions: TokenProcessorStrategyOptions = {
      minify: true,
    };

    processor.setOptions(newOptions);

    expect(processor['options']).toEqual({
      extractFromLayers: false,
      discardLayerDeclarations: true,
      minify: true,
    });
  });
});

describe('CssTokenProcessor and LayerProcessor', () => {
  let tokenizer: CssTokenizer;
  let cssProcessor: CssTokenProcessor;

  beforeEach(() => {
    tokenizer = new CssTokenizer();
    const layerProcessor = new LayerProcessor();
    cssProcessor = new CssTokenProcessor([layerProcessor]);
  });

  describe('Valid Inputs', () => {
    it('should discard @layer declarations', () => {
      const css = '@layer reset, base, utilities;';
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens);
      const cssOutput = cssProcessor.serialize(result);

      expect(cssOutput).toEqual('');
    });

    it('should extract @layer content and discard declarations', () => {
      const css = `
        @layer reset { h1 { font-size: 2rem; } }
        @layer base, utilities;
        @layer utilities { .btn { padding: 1rem; } }
      `;
      const tokens = tokenizer.tokenize(css);
      expect(tokens.length).toBe(3);

      // discard layer declarations
      const result = cssProcessor.execute(tokens, {
        extractFromLayers: true,
        minify: true,
      });

      expect(result.length).toBe(2);
      expect(result).toEqual([
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
        {
          type: 'rule',
          value: '.btn',
          details: { selector: '.btn' },
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

      const cssOutput = cssProcessor.serialize(result);
      expect(cssOutput).toEqual('h1{font-size:2rem;}.btn{padding:1rem;}');
    });

    it('should extract @layer content minimizing it', () => {
      const css = `
        @layer reset { h1 { font-size: 2rem; } }
        @layer base, utilities;
      `;
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens, {
        extractFromLayers: true,
        minify: true,
      });
      const cssOutput = cssProcessor.serialize(result);

      expect(cssOutput).toEqual('h1{font-size:2rem;}');
    });

    it('should retain @layer definitions but discard declarations', () => {
      const css = `
        @layer reset { h1 { font-size: 2rem; } }
        @layer base, utilities;
        @layer utilities { .btn { padding: 1rem; } }
      `;
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens, { minify: true });
      const cssOutput = cssProcessor.serialize(result);

      expect(cssOutput).toEqual(
        '@layer reset{h1{font-size:2rem;}}@layer utilities{.btn{padding:1rem;}}',
      );
    });
  });

  describe('Mixed Scenarios', () => {
    it('should extract discard layer declaration and handle @media rule, minifyng the result', () => {
      const css = `@layer reset,base;
        @media (max-width: 600px) { .class1 { color: red; } }`;
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens, { minify: true });
      const cssOutput = cssProcessor.serialize(result);
      expect(cssOutput).toEqual(
        `@media (max-width:600px){.class1{color:red;}}`,
      );
    });

    it('should extract discard layer declaration, extract and handle @media rule', () => {
      const css = `@layer reset,base;
        @layer reset { h1 { font-size: 2rem; } }
        @media (max-width: 600px) { .class1 { color: red; } }`;
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens, {
        extractFromLayers: true,
        minify: true,
      });
      const cssOutput = cssProcessor.serialize(result);
      expect(cssOutput).toEqual(
        `h1{font-size:2rem;}@media (max-width:600px){.class1{color:red;}}`,
      );
    });

    it('should discard @layer declarations but retain definitions', () => {
      const css = '@layer reset { h1 { font-size: 2rem; } } @layer base;';
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens, { minify: true });
      const cssOutput = cssProcessor.serialize(result);
      expect(cssOutput).toEqual('@layer reset{h1{font-size:2rem;}}');
    });

    it('should discard multiple @layer declarations and retain definitions', () => {
      const css = `
          @layer reset, base;
          @layer reset { h1 { font-size: 2rem; } }
          @layer utilities { .btn { padding: 1rem; } }
        `;
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens);
      const cssOutput = cssProcessor.serialize(result);
      expect(cssOutput).toEqual(
        `
@layer reset {
  h1 {
    font-size: 2rem;
  }
}

@layer utilities {
  .btn {
    padding: 1rem;
  }
}`.trim(),
      );
    });

    it('should handle multiple @layer definitions and declarations', () => {
      const css = `
          @layer reset { h1 { font-size: 2rem; } }
          @layer base, utilities;
          @layer utilities { .btn { padding: 1rem; } }
          body { background-color: #fff; }
        `;
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens, {
        extractFromLayers: true,
        minify: true,
      });
      const cssOutput = cssProcessor.serialize(result);
      expect(cssOutput).toEqual(
        'h1{font-size:2rem;}.btn{padding:1rem;}body{background-color:#fff;}',
      );
    });

    it('should handle invalid @layer declarations gracefully', () => {
      const css = `
          @layer reset { h1 { font-size: 2rem; } }
          @layer invalid-declaration;
        `;
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens);
      const cssOutput = cssProcessor.serialize(result);
      expect(cssOutput).toEqual(
        `
@layer reset {
  h1 {
    font-size: 2rem;
  }
}`.trim(),
      );
    });

    it('should return valid css', () => {
      const css = `
      @layer base {
            .class1 { color: red; }
            .class2 { color: blue; }
          }
          .class3 { color: green; }
      `;
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens, {
        extractFromLayers: true,
        minify: true,
      });
      const cssOutput = cssProcessor.serialize(result);
      expect(cssOutput).toEqual(
        `.class1{color:red;}.class2{color:blue;}.class3{color:green;}`,
      );
    });

    it('should tokenize global selectors', () => {
      const css = `
        @layer reset {
        *, *:before, *:after {
          box-sizing: border-box;
          border: 0;
        }
      }`;
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens, {
        extractFromLayers: true,
        minify: true,
      });
      const cssOutput = cssProcessor.serialize(result);
      expect(cssOutput).toEqual(
        `*, *:before, *:after{box-sizing:border-box;border:0;}`,
      );
    });

    it('should discard comments and extract layer content minifying it', () => {
      const css = `/* [taox] BEGIN */
            @layer reset{*,*:before,*:after{box-sizing:border-box;border:0;border-style:solid}}
            /* [taox] END */`;
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens, {
        extractFromLayers: true,
        minify: true,
      });
      const cssOutput = cssProcessor.serialize(result);
      expect(cssOutput).toEqual(
        `*, *:before, *:after{box-sizing:border-box;border:0;border-style:solid;}`,
      );
    });

    it('should handle layer declarations and definition', () => {
      const css = `/* [taox] BEGIN */
            @layer reset,base,components,utilities; @layer reset{*,*:before,*:after{box-sizing:border-box;border:0;border-style:solid}}
            /* [taox] END */`;
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens, {
        extractFromLayers: true,
        minify: true,
      });
      const cssOutput = cssProcessor.serialize(result);
      expect(cssOutput).toEqual(
        `*, *:before, *:after{box-sizing:border-box;border:0;border-style:solid;}`,
      );
    });

    it('should handle layers, global selectors and CSS custom props', () => {
      const css = `/* [taox] BEGIN */
            @layer reset,base,components,utilities;@layer reset{*,*:before,*:after{box-sizing:border-box;border:0;border-style:solid}}@layer base{:root{--hs-c-white: 1 0 0;--hs-c-black: 0 0 0;--hs-transparent: oklch(0 0 0 / 0);--hs-opacity: 1;--hs-font-mono: ui-monospace, sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace}}
            /* [taox] END */`;
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens, {
        extractFromLayers: true,
        minify: true,
      });
      const cssOutput = cssProcessor.serialize(result);
      expect(cssOutput).toEqual(
        `
*, *:before, *:after{box-sizing:border-box;border:0;border-style:solid;}:root{--hs-c-white: 1 0 0;--hs-c-black: 0 0 0;--hs-transparent: oklch(0 0 0 / 0);--hs-opacity: 1;--hs-font-mono: ui-monospace, sfmono-regular, menlo, monaco, consolas, "Liberation Mono", "Courier New", monospace;}`.trim(),
      );
    });

    it('main-class should handle pseudo-classes and selectors', () => {
      const css = `@layer base{.main-class :is(blockquote, dl, dd, h1, h2, h3, h4, h5, h6, figure, p, pre) { margin: 0 } .main-class :is(h1, h2, h3, h4, h5, h6, p) { overflow-wrap: break-word } .main-class :is(h1, h2, h3, h4, h5, h6) { word-break: break-word; text-wrap: balance } .main-class a { text-decoration: none }}`;
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens, {
        extractFromLayers: true,
        minify: true,
      });
      const cssOutput = cssProcessor.serialize(result);
      expect(cssOutput).toEqual(
        `
.main-class :is(blockquote, dl, dd, h1, h2, h3, h4, h5, h6, figure, p, pre){margin:0;}.main-class :is(h1, h2, h3, h4, h5, h6, p){overflow-wrap:break-word;}.main-class :is(h1, h2, h3, h4, h5, h6){word-break:break-word;text-wrap:balance;}.main-class a{text-decoration:none;}
`.trim(),
      );
    });
  });

  describe('Invalid Inputs', () => {
    it('should handle invalid token sequences gracefully', () => {
      const css = '@layer reset h1 font-size: 2rem; }';
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens);

      const cssOutput = cssProcessor.serialize(result);

      expect(cssOutput).toEqual('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty CSS gracefully', () => {
      const css = '';
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens, { minify: true });

      const cssOutput = cssProcessor.serialize(result);

      expect(cssOutput).toEqual('');
    });

    it('should handle @layer without identifier gracefully', () => {
      const css = '@layer ;';
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens);

      const cssOutput = cssProcessor.serialize(result);

      expect(cssOutput).toEqual('');
    });

    it('should handle mixed spacing and unexpected tokens', () => {
      const css = `
          @layer    reset , base ;
          h1   { font-size :  2rem ; }
          @layer utilities   { .btn { padding: 1rem; } }
        `;
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens);

      const cssOutput = cssProcessor.serialize(result);

      expect(cssOutput).toEqual(
        `
h1 {
  font-size: 2rem;
}

@layer utilities {
  .btn {
    padding: 1rem;
  }
}
`.trim(),
      );
    });

    it('should handle invalid @layer rules', () => {
      const css = '@layer reset { h1 { font-size: 2rem; } @invalid-rule ; }';
      const tokens = tokenizer.tokenize(css);
      const result = cssProcessor.execute(tokens);

      const cssOutput = cssProcessor.serialize(result);

      expect(cssOutput).toEqual(
        `
@layer reset {
  h1 {
    font-size: 2rem;
  }
  @invalid-rule
}
        `.trim(),
      );
    });
  });
});
