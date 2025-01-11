import { PluginConfig } from '../types';

export class CommandBuilder {
  static TEMPL_BIN = 'templ';
  static STATIC_TEMPL_BIN = 'static-templ';

  /**
   * Builds the command string for generating HTML files from Templ files.
   *
   * @param serverRoot - The root directory of the server.
   * @param resolvedOptions - The plugin options.
   * @returns The command string.
   */
  public static buildTemplGenerateCommand(
    serverRoot: string,
    options: PluginConfig,
  ): string {
    return `cd ${serverRoot}/${options.goProjectDir} && ${this.TEMPL_BIN} generate .`;
  }

  /**
   * Builds the command string for generating HTML files from Templ files.
   *
   * @param serverRoot - The root directory of the server.
   * @param resolvedOptions - The plugin options.
   * @returns The command string.
   */
  public static buildStaticTemplCommand(
    serverRoot: string,
    options: PluginConfig,
  ): string {
    const baseCmd = `cd ${serverRoot}/${options.goProjectDir} && ${this.STATIC_TEMPL_BIN} -m ${options.mode} -i ${options.inputDir} -g=${options.runTemplGenerate} -d=${options.debug}`;
    return options.mode === 'bundle'
      ? `${baseCmd} -o ${options.outputDir}`
      : baseCmd;
  }
}
