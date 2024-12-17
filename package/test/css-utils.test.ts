import { describe, it, expect } from 'vitest';
import { flattenCssContent } from '../src/css-utils';

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
      const result = flattenCssContent(input);
      expect(result).toBe(expected);
    });
  });
});
