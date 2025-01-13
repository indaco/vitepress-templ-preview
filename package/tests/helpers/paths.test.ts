import { describe, it, expect, vi, afterEach } from 'vitest';
import path from 'node:path';
import { handleOpMode } from '../../src/plugin/helpers/paths';
import { Logger } from '../../src/plugin/logger';
import { UserMessages } from '../../src/plugin/messages';
import { PluginConfig } from '../../src/types';

vi.mock('../../src/plugin/logger', () => ({
  Logger: {
    error: vi.fn(),
  },
}));

vi.mock('../../src/plugin/messages', () => ({
  UserMessages: {
    MODE_NOT_DEFINED: {
      headline: 'Mode Not Defined',
      message: 'The mode is not defined in the options.',
    },
    UNKNOWN_MODE_ERROR: {
      headline: 'Unknown Mode Error',
      message: 'The provided mode is not recognized.',
    },
  },
}));

describe('handleOpMode', () => {
  const serverRoot = '/path/to/server';
  const id = '/path/to/source/file.templ';
  const srcValue = 'components/component1';
  const baseOptions = {
    goProjectDir: 'my-go-project',
    inputDir: 'src',
    outputDir: 'dist',
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should generate paths correctly for inline mode', () => {
    const options: Partial<PluginConfig> = { ...baseOptions, mode: 'inline' };
    const result = handleOpMode(id, serverRoot, options, srcValue);

    expect(result).toEqual({
      templFile: path.resolve(path.dirname(id), '', `${srcValue}.templ`),
      htmlFile: path.resolve(
        path.dirname(id),
        path.dirname(srcValue),
        `${srcValue}.html`,
      ),
    });
  });

  it('should generate paths correctly for bundle mode', () => {
    const options: Partial<PluginConfig> = { ...baseOptions, mode: 'bundle' };
    const result = handleOpMode(id, serverRoot, options, srcValue);

    expect(result).toEqual({
      templFile: path.resolve(
        serverRoot,
        baseOptions.inputDir,
        `${srcValue}.templ`,
      ),
      htmlFile: path.resolve(
        serverRoot,
        baseOptions.outputDir,
        `${srcValue}.html`,
      ),
    });
  });

  it('should use goProjectDir when inputDir and outputDir are undefined in bundle mode', () => {
    const options: Partial<PluginConfig> = {
      mode: 'bundle',
      goProjectDir: 'my-go-project',
    };
    const result = handleOpMode(id, serverRoot, options, srcValue);

    expect(result).toEqual({
      templFile: path.resolve(
        serverRoot,
        options.goProjectDir!,
        `${srcValue}.templ`,
      ),
      htmlFile: path.resolve(
        serverRoot,
        options.goProjectDir!,
        `${srcValue}.html`,
      ),
    });
  });

  it('should throw an error if mode is not defined', () => {
    const options: Partial<PluginConfig> = { ...baseOptions, mode: undefined };

    expect(() => handleOpMode(id, serverRoot, options, srcValue)).toThrowError(
      `[vitepress-templ-preview] ${UserMessages.MODE_NOT_DEFINED.headline}: ${UserMessages.MODE_NOT_DEFINED.message}.`,
    );
    expect(Logger.error).toHaveBeenCalledWith(UserMessages.MODE_NOT_DEFINED);
  });

  it('should throw an error for an unknown mode', () => {
    const options = { ...baseOptions, mode: 'unknown' };

    expect(() => handleOpMode(id, serverRoot, options, srcValue)).toThrowError(
      `[vitepress-templ-preview] ${UserMessages.UNKNOWN_MODE_ERROR.headline}: ${UserMessages.UNKNOWN_MODE_ERROR.message}.`,
    );
    expect(Logger.error).toHaveBeenCalledWith(
      UserMessages.UNKNOWN_MODE_ERROR,
      'unknown',
    );
  });
});
