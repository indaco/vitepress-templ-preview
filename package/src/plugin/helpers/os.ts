import { platform } from 'os';
import { execFileSync, spawnSync } from 'node:child_process';
import type { Command } from '../command-builder';
import type { VTPMessage } from '../types';
import { Logger } from '../logger';
import { UserMessages } from '../messages';

/**
 * Checks if the required binaries are installed on the system.
 * @param binaries - The list of binaries to check.
 */
export function checkBinaries(binaries: string[]): void {
  binaries.forEach((binary) => {
    let result;

    if (platform() === 'win32') {
      // Windows: Use 'where' command
      result = spawnSync('where', [binary]);
    } else {
      // Other platforms: Use 'which' command
      result = spawnSync('which', [binary]);
    }

    if (result.status !== 0) {
      Logger.error(UserMessages.NO_BINARY, binary);
      throw new Error(
        `[vitepress-templ-preview] ${UserMessages.NO_BINARY.headline}: ${UserMessages.NO_BINARY.message} "${binary}"`,
      );
    }
  });
}

/**
 * Executes a structured command synchronously without spawning a shell.
 * @param command - The structured command to execute.
 */
export function executeCommand(command: Command): void {
  Logger.info(
    UserMessages.EXEC_SYSTEM_CMD,
    `${command.bin} ${command.args.join(' ')}`,
  );
  try {
    const stdout = execFileSync(command.bin, command.args, {
      cwd: command.cwd,
      stdio: 'pipe',
    });
    if (stdout.toLocaleString() != '')
      Logger.info(<VTPMessage>{ message: stdout.toLocaleString() });
  } catch (error: unknown) {
    const err = error as Error & { stderr?: Buffer };
    Logger.error(UserMessages.EXEC_SYSTEM_CMD_ERROR, err.message);
    if (err.stderr) {
      Logger.error(UserMessages.GENERIC_ERROR, err.stderr.toString());
    }
    throw error;
  }
}
