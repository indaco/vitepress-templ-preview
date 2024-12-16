import { describe, it, expect } from 'vitest';
import { CSSLayerExtractor } from './css-layer-extractor';

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

  public testExtractCssRules(layerContent: string): string[] {
    return this.extractCssRules(layerContent);
  }

  public testExtractAndRemoveLayerBlocks(content: string): {
    extractedContent: string[];
    cleanedContent: string;
  } {
    return this.extractAndRemoveLayerBlocks(content);
  }

  public testFlattenCssContent(content: string): string {
    return this.flattenCssContent(content);
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
    ];

    cases.forEach(({ input, expected }) => {
      const result = extractor.testExtractLayerBlocks(input);
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
    ];

    cases.forEach(({ input, expected }) => {
      const result = extractor.testExtractCssRules(input);
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
    ];

    cases.forEach(({ input, expectedExtracted, expectedCleaned }) => {
      const { extractedContent, cleanedContent } =
        extractor.testExtractAndRemoveLayerBlocks(input);
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
    ];

    cases.forEach(({ input, expected }) => {
      const result = extractor.testFlattenCssContent(input);
      expect(result).toBe(expected);
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
    ];

    cases.forEach(({ input, expected }) => {
      expect(extractor.run(input)).toBe(expected);
    });
  });
});
