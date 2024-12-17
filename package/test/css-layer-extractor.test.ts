import { describe, it, expect } from 'vitest';
import { CSSLayerExtractor } from '../src/css-layer-extractor';

// This subclass exposes protected methods as public for testing purposes
export class CSSLayerExtractorTestable extends CSSLayerExtractor {
  public static override getInstance(): CSSLayerExtractorTestable {
    if (!this.instance) {
      this.instance = new CSSLayerExtractorTestable();
    }
    return this.instance as CSSLayerExtractorTestable;
  }

  public testRemoveStyleTags(content: string): string {
    return this.removeStyleTags(content);
  }

  public testExtractTopLayerDeclarations(content: string): string {
    return this.extractTopLayerDeclarations(content);
  }

  public testExtractLayerBlocks(content: string): string[] {
    return this.extractLayerBlocks(content);
  }

  public testExtractAndRemoveLayerBlocks(content: string): {
    extractedContent: string[];
    cleanedContent: string;
  } {
    return this.extractAndRemoveLayerBlocks(content);
  }
}

const extractor = CSSLayerExtractorTestable.getInstance();

describe('removeStyleTags', () => {
  it('should remove <style> tags but keep the inner content', () => {
    const cases = [
      {
        input: '<style type="text/css">.base { color: red; }</style>',
        expected: '.base { color: red; }',
      },
      {
        input: '<style>.base { color: red; }</style>',
        expected: '.base { color: red; }',
      },
      {
        input: '<style>  .base { color: red; }  </style>',
        expected: '.base { color: red; }',
      },
      {
        input: '<style type="text/css"> </style>',
        expected: '',
      },
      {
        input: 'No <style> tag here',
        expected: 'No <style> tag here',
      },
    ];

    cases.forEach(({ input, expected }) => {
      expect(extractor.testRemoveStyleTags(input)).toBe(expected);
    });
  });
});

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
      expect(extractor.testExtractTopLayerDeclarations(input)).toBe(expected);
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
      const result = extractor.testExtractLayerBlocks(input);
      expect(result).toEqual(expected);
    });
  });

  it('should remove top definition for layers and extract @layer declaration', () => {
    const input = `
    @layer base, components;
    @layer components {
      :is(button,a).hans-btn{--hs-btn-font-family: var(--hs-font-family, var(--hs-font-sans));}
    }
    .not-in-layer { color: red; }
  `;
    const expected = [
      ':is(button,a).hans-btn{--hs-btn-font-family: var(--hs-font-family, var(--hs-font-sans));}',
    ];

    const result = extractor.testExtractLayerBlocks(input);
    expect(result).toEqual(expected);
  });

  it('should extract multiple @layer declarations on the same line', () => {
    const input = `
    @layer base, components;@layer components {:is(button,a).hans-btn{--hs-btn-font-family: var(--hs-font-family, var(--hs-font-sans));}}
    .not-in-layer { color: red; }
  `;
    const expected = [
      ':is(button,a).hans-btn{--hs-btn-font-family: var(--hs-font-family, var(--hs-font-sans));}',
    ];

    const result = extractor.testExtractLayerBlocks(input);
    expect(result).toEqual(expected);
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
        extractor.testExtractAndRemoveLayerBlocks(input);
      expect(extractedContent).toEqual(expectedExtracted);
      expect(cleanedContent).toBe(expectedCleaned);
    });
  });
});

describe('cleanStyleTags', () => {
  it('should clean the style tags correctly', () => {
    const cases = [
      {
        input: `<style type="text/css"> @layer base { .base { color: red; } }</style>`,
        expected: `<style type="text/css">\n.base { color: red; }\n</style>`,
      },
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
      {
        input: `<style type="text/css"></style>`,
        expected: '',
      },
      {
        input: `<style type="text/css">\n</style>`,
        expected: '',
      },
    ];

    cases.forEach(({ input, expected }) => {
      expect(extractor.run(input)).toBe(expected);
    });
  });
});
