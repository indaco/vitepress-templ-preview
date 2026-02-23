import { PluginConfig } from '../types';

export interface Command {
  bin: string;
  args: string[];
  cwd: string;
}

export class CommandBuilder {
  static TEMPL_BIN = 'templ';
  static STATIC_TEMPL_BIN = 'static-templ';

  /**
   * Builds the command for generating HTML files from Templ files.
   *
   * @param serverRoot - The root directory of the server.
   * @param options - The plugin options.
   * @returns The structured command.
   */
  public static buildTemplGenerateCommand(
    serverRoot: string,
    options: PluginConfig,
  ): Command {
    return {
      bin: this.TEMPL_BIN,
      args: ['generate', '.'],
      cwd: `${serverRoot}/${options.goProjectDir}`,
    };
  }

  /**
   * Builds the command for running static-templ.
   *
   * @param serverRoot - The root directory of the server.
   * @param options - The plugin options.
   * @returns The structured command.
   */
  public static buildStaticTemplCommand(
    serverRoot: string,
    options: PluginConfig,
  ): Command {
    const args = [
      '-m',
      String(options.mode),
      '-i',
      String(options.inputDir),
      `-g=false`,
      `-d=${options.debug}`,
    ];

    if (options.mode === 'bundle') {
      args.push('-o', String(options.outputDir));
    }

    return {
      bin: this.STATIC_TEMPL_BIN,
      args,
      cwd: `${serverRoot}/${options.goProjectDir}`,
    };
  }
}
