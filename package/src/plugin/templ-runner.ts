import { PluginConfig } from '../types';
import { checkBinaries, executeCommandSync } from '../utils';
import { CommandBuilder } from './command-builder';

export class TemplTaskRunner {
  private static TEMPL_BIN = 'templ';
  private static STATIC_TEMPL_BIN = 'static-templ';

  constructor(
    private serverRoot: string,
    private options: PluginConfig,
  ) {}

  public run() {
    this.ensureBinaries();
    const { staticCmd, templCmd } = this.buildCommand();

    if (!this.options.runTemplGenerate) {
      executeCommandSync(templCmd);
    }
    executeCommandSync(staticCmd);
  }

  private ensureBinaries() {
    checkBinaries([TemplTaskRunner.STATIC_TEMPL_BIN]);
    if (!this.options.runTemplGenerate) {
      checkBinaries([TemplTaskRunner.TEMPL_BIN]);
    }
  }

  private buildCommand() {
    const staticCmd = CommandBuilder.buildStaticTemplCommand(
      this.serverRoot,
      this.options,
    );
    const templCmd = CommandBuilder.buildTemplGenerateCommand(
      this.serverRoot,
      this.options,
    );

    return { staticCmd, templCmd };
  }
}
