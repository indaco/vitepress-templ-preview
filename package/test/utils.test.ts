/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkBinaries,
  executeCommandSync,
  escapeForJSON,
  unescapeFromJSON,
  extractInnerCode,
} from '../src/utils'; // Replace './your-file' with the correct file path
import { Logger } from '../src/logger';
import { platform } from 'os';
import { spawnSync, execSync } from 'node:child_process';

// Correctly mock os, child_process, and logger modules using Vitest's recommendations
vi.mock('os', () => ({
  platform: vi.fn(),
}));

vi.mock('node:child_process', () => ({
  spawnSync: vi.fn(),
  execSync: vi.fn(),
}));

vi.mock('../src/logger', async () => {
  const actual = await vi.importActual('../src/logger');
  return {
    ...actual,
    Logger: {
      info: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe('checkBinaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully check for binaries on a non-Windows system', () => {
    vi.mocked(platform).mockReturnValue('linux');
    vi.mocked(spawnSync).mockReturnValue({ status: 0 } as any);

    checkBinaries(['node', 'npm']);

    expect(spawnSync).toHaveBeenCalledWith('which', ['node']);
    expect(spawnSync).toHaveBeenCalledWith('which', ['npm']);
    expect(Logger.error).not.toHaveBeenCalled();
  });

  it('should successfully check for binaries on Windows system', () => {
    vi.mocked(platform).mockReturnValue('win32');
    vi.mocked(spawnSync).mockReturnValue({ status: 0 } as any);

    checkBinaries(['node', 'npm']);

    expect(spawnSync).toHaveBeenCalledWith('where', ['node']);
    expect(spawnSync).toHaveBeenCalledWith('where', ['npm']);
    expect(Logger.error).not.toHaveBeenCalled();
  });

  it('should throw an error if a binary is not found', () => {
    vi.mocked(platform).mockReturnValue('linux');
    vi.mocked(spawnSync).mockReturnValue({ status: 1 } as any);

    expect(() => checkBinaries(['nonexistent-binary'])).toThrowError(
      '[vitepress-templ-preview] Command Not Found: The specified command is not installed or was not found in the system PATH. "nonexistent-binary"',
    );

    expect(Logger.error).toHaveBeenCalledWith(
      expect.anything(),
      'nonexistent-binary',
    );
  });
});

describe('executeCommandSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute a command and log the output', () => {
    vi.mocked(execSync).mockReturnValue(Buffer.from('command output'));

    executeCommandSync('echo hello');

    expect(execSync).toHaveBeenCalledWith('echo hello', { stdio: 'pipe' });
    expect(Logger.info).toHaveBeenCalledWith({ message: 'command output' });
  });

  it('should handle errors thrown by execSync', () => {
    const error = new Error('command failed');
    vi.mocked(execSync).mockImplementation(() => {
      throw Object.assign(error, { stderr: Buffer.from('error details') });
    });

    expect(() => executeCommandSync('false')).toThrowError('command failed');

    expect(Logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        headline: 'Command Execution Error',
        message:
          'An error occurred while executing the system command. Check for system errors or missing binaries.',
      }),
      'command failed',
    );

    expect(Logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        headline: 'Error',
        message: 'An unexpected error occurred. Please try again later.',
      }),
      'error details',
    );
  });

  it('should handle execSync without stdout', () => {
    vi.mocked(execSync).mockReturnValue(Buffer.from(''));

    executeCommandSync('echo hello');

    expect(Logger.info).not.toHaveBeenCalledWith({ message: '' });
  });
});

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

describe('extractInnerCode', () => {
  it('should extract inner code from templ blocks', () => {
    const templBlocks = [
      'package main\\n\\nimport (\\n"fmt"\\n"log"\\n)\\ntempl AlertDemo() {\\n  @alertCss()\\n  @alert("Success", "Files uploaded")\\n}',
    ];
    const expectedOutput = [
      '@alertCss()\n  @alert("Success", "Files uploaded")',
    ];
    const result = extractInnerCode(templBlocks);

    expect(result).toEqual(expectedOutput);
  });

  it('should handle multiple templated blocks', () => {
    const templBlocks = [
      'templ AlertOne() { @alertCss() }',
      'templ AlertTwo() { @alert("Warning", "Check this") }',
    ];
    const expectedOutput = ['@alertCss()', '@alert("Warning", "Check this")'];
    const result = extractInnerCode(templBlocks);

    expect(result).toEqual(expectedOutput);
  });

  it('should handle blocks without braces gracefully', () => {
    const templBlocks = ['templ AlertThree'];
    const expectedOutput = [''];
    const result = extractInnerCode(templBlocks);

    expect(result).toEqual(expectedOutput);
  });

  it('should handle blocks with no inner code', () => {
    const templBlocks = ['templ AlertFour() {}'];
    const expectedOutput = [''];
    const result = extractInnerCode(templBlocks);

    expect(result).toEqual(expectedOutput);
  });

  it('should handle empty input array', () => {
    const templBlocks: string[] = [];
    const expectedOutput: string[] = [];
    const result = extractInnerCode(templBlocks);

    expect(result).toEqual(expectedOutput);
  });
});
