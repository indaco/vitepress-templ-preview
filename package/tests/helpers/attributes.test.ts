import { describe, it, expect } from 'vitest';
import {
  parseAttrs,
  getAttributeOrElse,
} from '../../src/plugin/helpers/attributes';
import type { Token } from 'markdown-it/index.js';

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

describe('getAttributeOrElse', () => {
  function makeToken(attrs: [string, string][]): Token {
    return { attrs } as Token;
  }

  it('should return the attribute value as a string when parseJson is false', () => {
    const token = makeToken([['data-preview', 'true']]);
    const result = getAttributeOrElse(token, 'data-preview', 'false');
    expect(result).toBe('true');
    expect(typeof result).toBe('string');
  });

  it('should return the default value as a string when attribute is missing and parseJson is false', () => {
    const token = makeToken([]);
    const result = getAttributeOrElse(token, 'data-preview', 'default-val');
    expect(result).toBe('default-val');
    expect(typeof result).toBe('string');
  });

  it('should return a boolean when parseJson is true and attribute exists', () => {
    const token = makeToken([['data-preview', 'true']]);
    const result = getAttributeOrElse(token, 'data-preview', 'false', true);
    expect(result).toBe(true);
    expect(typeof result).toBe('boolean');
  });

  it('should return false when parseJson is true and attribute value is "false"', () => {
    const token = makeToken([['data-preview', 'false']]);
    const result = getAttributeOrElse(token, 'data-preview', 'true', true);
    expect(result).toBe(false);
    expect(typeof result).toBe('boolean');
  });

  it('should return the default parsed as boolean when attribute is missing and parseJson is true', () => {
    const token = makeToken([]);
    const result = getAttributeOrElse(token, 'data-preview', 'true', true);
    expect(result).toBe(true);
    expect(typeof result).toBe('boolean');
  });

  it('should handle token with null attrs', () => {
    const token = { attrs: null } as Token;
    const result = getAttributeOrElse(token, 'data-preview', 'fallback');
    expect(result).toBe('fallback');
  });
});
