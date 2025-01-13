import { describe, it, expect } from 'vitest';
import { CommandBuilder } from '../src/plugin/command-builder';
import { PluginConfig } from '../src/types';

describe('CommandBuilder', () => {
  const serverRoot = '/path/to/server';
  const baseOptions: PluginConfig = {
    goProjectDir: 'my-go-project',
    mode: 'inline',
    inputDir: 'demos',
    outputDir: 'output',
    debug: false,
    runTemplGenerate: true,
    cacheSize: 100,
  };

  describe('buildTemplGenerateCommand', () => {
    it('should build the correct command for generating HTML files using `templ`', () => {
      const command = CommandBuilder.buildTemplGenerateCommand(
        serverRoot,
        baseOptions,
      );
      expect(command).toBe(
        'cd /path/to/server/my-go-project && templ generate .',
      );
    });
  });

  describe('buildStaticTemplCommand', () => {
    it('should build the correct command for inline mode', () => {
      const command = CommandBuilder.buildStaticTemplCommand(
        serverRoot,
        baseOptions,
      );
      expect(command).toBe(
        'cd /path/to/server/my-go-project && static-templ -m inline -i demos -g=true -d=false',
      );
    });

    it('should build the correct command for bundle mode', () => {
      const bundleOptions: PluginConfig = { ...baseOptions, mode: 'bundle' };
      const command = CommandBuilder.buildStaticTemplCommand(
        serverRoot,
        bundleOptions,
      );
      expect(command).toBe(
        'cd /path/to/server/my-go-project && static-templ -m bundle -i demos -g=true -d=false -o output',
      );
    });

    it('should include debug flag when set to true', () => {
      const debugOptions = { ...baseOptions, debug: true };
      const command = CommandBuilder.buildStaticTemplCommand(
        serverRoot,
        debugOptions,
      );
      expect(command).toBe(
        'cd /path/to/server/my-go-project && static-templ -m inline -i demos -g=true -d=true',
      );
    });

    it('should include runTemplGenerate flag when set to false', () => {
      const noGenerateOptions = { ...baseOptions, runTemplGenerate: false };
      const command = CommandBuilder.buildStaticTemplCommand(
        serverRoot,
        noGenerateOptions,
      );
      expect(command).toBe(
        'cd /path/to/server/my-go-project && static-templ -m inline -i demos -g=false -d=false',
      );
    });

    it('should build the correct command for bundle mode with debug enabled', () => {
      const debugBundleOptions: PluginConfig = {
        ...baseOptions,
        mode: 'bundle',
        debug: true,
      };
      const command = CommandBuilder.buildStaticTemplCommand(
        serverRoot,
        debugBundleOptions,
      );
      expect(command).toBe(
        'cd /path/to/server/my-go-project && static-templ -m bundle -i demos -g=true -d=true -o output',
      );
    });
  });
});
