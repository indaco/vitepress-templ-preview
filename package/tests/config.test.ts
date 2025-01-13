import { describe, it, expect } from 'vitest';
import { ConfigResolver } from '../src/plugin/config'; // Adjust the path as necessary
import { PluginConfig } from '../src/types'; // Adjust the path as necessary

describe('ConfigResolver', () => {
  const defaultOptions: PluginConfig = {
    goProjectDir: '',
    mode: 'inline',
    inputDir: 'components',
    outputDir: 'output',
    debug: false,
    runTemplGenerate: true,
    cacheSize: 100,
  };

  it('should return the default options when no user options are provided', () => {
    const resolvedConfig = ConfigResolver.resolve();
    expect(resolvedConfig).toEqual(defaultOptions);
  });

  it('should override default options with user options', () => {
    const userOptions: Partial<PluginConfig> = {
      goProjectDir: 'my-go-project',
      mode: 'bundle',
      debug: true,
    };
    const resolvedConfig = ConfigResolver.resolve(userOptions);

    expect(resolvedConfig).toEqual({
      ...defaultOptions,
      goProjectDir: 'my-go-project',
      mode: 'bundle',
      debug: true,
    });
  });

  it('should merge default options with partially provided user options', () => {
    const userOptions: Partial<PluginConfig> = {
      inputDir: 'custom-components',
    };
    const resolvedConfig = ConfigResolver.resolve(userOptions);

    expect(resolvedConfig).toEqual({
      ...defaultOptions,
      inputDir: 'custom-components',
    });
  });

  it('should preserve default options for properties not provided by user options', () => {
    const userOptions: Partial<PluginConfig> = {
      cacheSize: 50,
    };
    const resolvedConfig = ConfigResolver.resolve(userOptions);

    expect(resolvedConfig).toEqual({
      ...defaultOptions,
      cacheSize: 50,
    });
  });

  it('should work when all user options are provided', () => {
    const userOptions: Partial<PluginConfig> = {
      goProjectDir: 'complete-go-project',
      mode: 'bundle',
      inputDir: 'full-components',
      outputDir: 'full-output',
      debug: true,
      runTemplGenerate: false,
      cacheSize: 200,
    };
    const resolvedConfig = ConfigResolver.resolve(userOptions);

    expect(resolvedConfig).toEqual(userOptions); // Should match the user options exactly
  });
});
