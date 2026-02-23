import { describe, it, expect } from 'vitest';
import {
  escapeForJSON,
  unescapeFromJSON,
} from '../../src/plugin/helpers/strings';

describe('escapeForJSON', () => {
  it('should escape backslashes, double quotes, single quotes, newlines, carriage returns, and tabs', () => {
    const input = `This is a "test" string with \ special characters \n and newlines.`;
    const expectedOutput = `This is a \\"test\\" string with  special characters \\n and newlines.`;
    const result = escapeForJSON(input);

    expect(result).toBe(expectedOutput);
  });

  it('should escape less-than and greater-than signs', () => {
    const input = 'This is <tag> with content > end';
    const expectedOutput = 'This is \\u003Ctag\\u003E with content \\u003E end';
    const result = escapeForJSON(input);

    expect(result).toBe(expectedOutput);
  });

  it('should escape single quotes as unicode without corrupting them', () => {
    const input = "it's a test with 'quotes'";
    const result = escapeForJSON(input);

    expect(result).toBe('it\\u0027s a test with \\u0027quotes\\u0027');
    // Round-trip should restore the original
    expect(unescapeFromJSON(result)).toBe(input);
  });
});

describe('unescapeFromJSON', () => {
  it('should unescape escaped backslashes, double quotes, newlines, carriage returns, and tabs', () => {
    const input = `This is a \\"test\\" string with \\\\ special characters \\n and newlines.`;
    const expectedOutput = `This is a "test" string with \\ special characters \n and newlines.`;
    const result = unescapeFromJSON(input);

    expect(result).toBe(expectedOutput);
  });

  it('should unescape less-than and greater-than signs', () => {
    const input = 'This is \\u003Ctag\\u003E with content \\u003E end';
    const expectedOutput = 'This is <tag> with content > end';
    const result = unescapeFromJSON(input);

    expect(result).toBe(expectedOutput);
  });

  it('should handle empty strings', () => {
    const input = '';
    const expectedOutput = '';
    const result = unescapeFromJSON(input);

    expect(result).toBe(expectedOutput);
  });

  it('should unescape single quotes from unicode', () => {
    const input = 'it\\u0027s a test';
    const result = unescapeFromJSON(input);

    expect(result).toBe("it's a test");
  });
});
