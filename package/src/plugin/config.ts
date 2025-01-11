import { PluginConfig } from '../types';

// Default values for the PluginOptions
const defaultPluginOptions: PluginConfig = {
  goProjectDir: '',
  mode: 'inline',
  inputDir: 'components',
  outputDir: 'output',
  debug: false,
  runTemplGenerate: true,
  cacheSize: 100,
};

export class ConfigResolver {
  static resolve(userOptions?: Partial<PluginConfig>): PluginConfig {
    return {
      ...defaultPluginOptions,
      ...userOptions,
    };
  }
}
