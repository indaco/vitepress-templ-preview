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
});
