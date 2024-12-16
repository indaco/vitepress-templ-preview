import { describe, it, expect } from 'vitest';
import { CSSLayerExtractor } from './css-layer-extractor';

// Get the singleton instance of CSSLayerExtractor
const extractor = CSSLayerExtractor.getInstance();

describe('extractTopLayerDeclarations', () => {
  it('should extract top-level @layer declarations', () => {
    const cases = [
      { input: '@layer base;', expected: '@layer base;' },
      { input: '@layer reset, base;', expected: '@layer reset, base;' },
      {
        input: '@layer reset, base; .base { color: red; }',
        expected: '@layer reset, base;',
      },
      { input: '.base { color: red; }', expected: '' },
    ];

    cases.forEach(({ input, expected }) => {
      expect(extractor.extractTopLayerDeclarations(input)).toBe(expected);
    });
  });
});

describe('extractLayerBlocks', () => {
  it('should extract content from @layer blocks', () => {
    const cases = [
      {
        input: `
          @layer base {
            .base { color: red; }
          }
        `,
        expected: ['.base { color: red; }'],
      },
      {
        input: `
          @layer base, components {
            .base { color: red; }
            .component { color: blue; }
          }
        `,
        expected: ['.base { color: red; } .component { color: blue; }'],
      },
    ];

    cases.forEach(({ input, expected }) => {
      const result = extractor.extractLayerBlocks(input);
      expect(result).toEqual(expected);
    });
  });
});

describe('extractCssRules', () => {
  it('should extract CSS rules from a @layer content', () => {
    const cases = [
      { input: `.base { color: red; }`, expected: [`.base { color: red; }`] },
      {
        input: `.base { color: red; } .component { color: blue; }`,
        expected: [`.base { color: red; }`, `.component { color: blue; }`],
      },
      { input: ``, expected: [] },
      { input: `.base { color: red; } }`, expected: [`.base { color: red; }`] },
    ];

    cases.forEach(({ input, expected }) => {
      const result = extractor.extractCssRules(input);
      expect(result).toEqual(expected);
    });
  });
});

describe('extractAndRemoveLayerBlocks', () => {
  it('should extract content from @layer blocks and clean the content', () => {
    const cases = [
      {
        input: `
          @layer base {
            .base { color: red; }
          }
        `,
        expectedExtracted: ['.base { color: red; }'],
        expectedCleaned: '',
      },
      {
        input: `
          @layer base {
            .base { color: red; }
          }
          .non-layer-class { color: yellow; }
        `,
        expectedExtracted: ['.base { color: red; }'],
        expectedCleaned: '.non-layer-class { color: yellow; }',
      },
    ];

    cases.forEach(({ input, expectedExtracted, expectedCleaned }) => {
      const { extractedContent, cleanedContent } =
        extractor.extractAndRemoveLayerBlocks(input);
      expect(extractedContent).toEqual(expectedExtracted);
      expect(cleanedContent).toBe(expectedCleaned);
    });
  });
});

describe('flattenCssContent', () => {
  it('should flatten CSS content properly', () => {
    const cases = [
      {
        input: `
          .base { color: red; }
          .component { color: blue; }
        `,
        expected: '.base { color: red; } .component { color: blue; }',
      },
      {
        input: `
          .base {
            color: red;
            border: 1px solid black;
          }
        `,
        expected: '.base { color: red; border: 1px solid black; }',
      },
      {
        input: `
          .base { color: red; }
          .component {}
        `,
        expected: '.base { color: red; } .component { }',
      },
    ];

    cases.forEach(({ input, expected }) => {
      const result = extractor.flattenCssContent(input);
      expect(result).toBe(expected);
    });
  });
});

/*
describe('cleanStyleTags', () => {
  it('should clean the style tags correctly', () => {
    const cases = [
      {
        input:
          '<style type="text/css"> @layer base { .base { color: red; } }</style>',
        expected: '<style type="text/css">\n.base { color: red; }\n</style>',
      },
      {
        input: '<style type="text/css"> .non-layer { color: blue; } </style>',
        expected:
          '<style type="text/css">\n.non-layer { color: blue; }\n</style>',
      },
      {
        input:
          '<style type="text/css"> @layer base { .base { color: red; } } .other { color: yellow; }</style>',
        expected:
          '<style type="text/css">\n.base { color: red; }\n.other { color: yellow; }\n</style>',
      },
      {
        input:
          '<style type="text/css">@layer reset, base, components, utilities;\n@layer base { .base { color: red; } } .other { color: yellow; }</style>',
        expected:
          '<style type="text/css">\n.base { color: red; }\n.other { color: yellow; }\n</style>',
      },
      {
        input: `<style type="text/css"></style>`,
        expected: '',
      },
      {
        input: `<style type="text/css">\n</style>`,
        expected: '',
      },
      {
        input: `
          <style type="text/css">
            @layer base {
              .base { color: red; }
            }
            @layer components {
              .component { color: blue; }
            }
          </style>
        `,
        expected: `<style type="text/css">\n.base { color: red; }\n.component { color: blue; }\n</style>`,
      },
    ];

    cases.forEach(({ input, expected }) => {
      expect(extractor.cleanStyleTags(input)).toBe(expected);
    });
  });
});
*/
