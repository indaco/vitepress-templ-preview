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
    it('should return structured command for templ generate', () => {
      const command = CommandBuilder.buildTemplGenerateCommand(
        serverRoot,
        baseOptions,
      );
      expect(command).toEqual({
        bin: 'templ',
        args: ['generate', '.'],
        cwd: '/path/to/server/my-go-project',
      });
    });
  });

  describe('buildStaticTemplCommand', () => {
    it('should return structured command for inline mode', () => {
      const command = CommandBuilder.buildStaticTemplCommand(
        serverRoot,
        baseOptions,
      );
      expect(command).toEqual({
        bin: 'static-templ',
        args: ['-m', 'inline', '-i', 'demos', '-g=false', '-d=false'],
        cwd: '/path/to/server/my-go-project',
      });
    });

    it('should include -o flag for bundle mode', () => {
      const bundleOptions: PluginConfig = { ...baseOptions, mode: 'bundle' };
      const command = CommandBuilder.buildStaticTemplCommand(
        serverRoot,
        bundleOptions,
      );
      expect(command).toEqual({
        bin: 'static-templ',
        args: [
          '-m',
          'bundle',
          '-i',
          'demos',
          '-g=false',
          '-d=false',
          '-o',
          'output',
        ],
        cwd: '/path/to/server/my-go-project',
      });
    });

    it('should include debug flag when set to true', () => {
      const debugOptions = { ...baseOptions, debug: true };
      const command = CommandBuilder.buildStaticTemplCommand(
        serverRoot,
        debugOptions,
      );
      expect(command).toEqual({
        bin: 'static-templ',
        args: ['-m', 'inline', '-i', 'demos', '-g=false', '-d=true'],
        cwd: '/path/to/server/my-go-project',
      });
    });

    it('should include runTemplGenerate flag when set to false', () => {
      const noGenerateOptions = { ...baseOptions, runTemplGenerate: false };
      const command = CommandBuilder.buildStaticTemplCommand(
        serverRoot,
        noGenerateOptions,
      );
      expect(command).toEqual({
        bin: 'static-templ',
        args: ['-m', 'inline', '-i', 'demos', '-g=false', '-d=false'],
        cwd: '/path/to/server/my-go-project',
      });
    });

    it('should return structured command for bundle mode with debug enabled', () => {
      const debugBundleOptions: PluginConfig = {
        ...baseOptions,
        mode: 'bundle',
        debug: true,
      };
      const command = CommandBuilder.buildStaticTemplCommand(
        serverRoot,
        debugBundleOptions,
      );
      expect(command).toEqual({
        bin: 'static-templ',
        args: [
          '-m',
          'bundle',
          '-i',
          'demos',
          '-g=false',
          '-d=true',
          '-o',
          'output',
        ],
        cwd: '/path/to/server/my-go-project',
      });
    });
  });
});
