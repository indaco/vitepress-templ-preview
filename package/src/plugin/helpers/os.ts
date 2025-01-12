/* eslint-disable @typescript-eslint/no-explicit-any */
import { platform } from 'os';
import { execSync, spawnSync } from 'node:child_process';
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
 * Executes a command synchronously.
 * @param command - The command string to execute.
 */
export function executeCommandSync(command: string): void {
  Logger.info(UserMessages.EXEC_SYSTEM_CMD, command);
  try {
    const stdout = execSync(command, { stdio: 'pipe' });
    if (stdout.toLocaleString() != '')
      Logger.info(<VTPMessage>{ message: stdout.toLocaleString() });
  } catch (error: any) {
    Logger.error(UserMessages.EXEC_SYSTEM_CMD_ERROR, error.message);
    if (error.stderr) {
      Logger.error(UserMessages.GENERIC_ERROR, error.stderr.toString());
    }
    throw error; // Re-throw the error to ensure it can be handled by the caller if necessary
  }
}
