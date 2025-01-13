import { describe, it, expect } from 'vitest';
import { parseAttrs } from '../../src/plugin/helpers/attributes';

describe('parseAttrs', () => {
  it('should parse a single attribute correctly', () => {
    const input = 'class="button"';
    const result = parseAttrs(input);
    expect(result).toEqual({ class: 'button' });
  });

  it('should parse multiple attributes correctly', () => {
    const input = 'class="button" id="main" data-test="example"';
    const result = parseAttrs(input);
    expect(result).toEqual({
      class: 'button',
      id: 'main',
      'data-test': 'example',
    });
  });

  it('should return an empty object for an empty input string', () => {
    const input = '';
    const result = parseAttrs(input);
    expect(result).toEqual({});
  });

  it('should handle attributes with special characters in the key', () => {
    const input = 'data-test="value" aria-label="label"';
    const result = parseAttrs(input);
    expect(result).toEqual({
      'data-test': 'value',
      'aria-label': 'label',
    });
  });
});
