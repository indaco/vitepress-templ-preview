/* eslint-disable @typescript-eslint/no-explicit-any */
import { execSync, spawnSync } from 'node:child_process';
import type { UserMessage } from './types';
import { Logger } from './logger';
import { UserMessages } from './user-messages';

/**
 * Checks if the required binaries are installed on the system.
 * @param binaries - The list of binaries to check.
 */
export function checkBinaries(binaries: string[]): void {
  binaries.forEach((binary) => {
    const result = spawnSync('which', [binary]);
    if (result.status !== 0) {
      Logger.error(UserMessages.NO_BINARY, binary);
      throw new Error(
        `[vitepress-templ-preview] ${UserMessages.NO_BINARY.headline}: ${UserMessages.NO_BINARY.message} "${binary}`,
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
      Logger.info(<UserMessage>{ message: stdout.toLocaleString() });
  } catch (error: any) {
    Logger.error(UserMessages.EXEC_SYSTEM_CMD_ERROR, error.message);
    if (error.stderr) {
      Logger.error(UserMessages.GENERIC_ERROR, error.stderr.toString());
    }
    throw error; // Re-throw the error to ensure it can be handled by the caller if necessary
  }
}

/**
 * Escapes special characters in a string to make it safe for inclusion in a JSON string,
 * including replacing single quotes with escaped double quotes.
 *
 * @param {string} str - The input string to be escaped.
 * @returns {string} - The escaped string, safe for inclusion in JSON.
 *
 * @example
 * const unsafeString = 'This is a "test" string with \\ special characters \n and newlines.';
 * const safeString = escapeForJSON(unsafeString);
 * console.log(safeString); // Output: This is a \"test\" string with \\ special characters \\n and newlines.
 */
export function escapeForJSON(str: string): string {
  return str
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/'/g, '\\"') // Replace single quotes with escaped double quotes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(/\t/g, '\\t') // Escape tabs
    .replace(/</g, '\\u003C') // Escape less-than sign
    .replace(/>/g, '\\u003E'); // Escape greater-than sign
}

/**
 * Unescapes a string that was previously escaped for JSON,
 * converting escaped sequences back to their original characters.
 *
 * @param {string} str - The input string to be unescaped.
 * @returns {string} - The unescaped string.
 *
 * @example
 * const escapedString = 'This is a \\"test\\" string with \\\\ special characters \\n and newlines.';
 * const unescapedString = unescapeFromJSON(escapedString);
 * console.log(unescapedString); // Output: This is a "test" string with \ special characters \n and newlines.
 */
export function unescapeFromJSON(str: string): string {
  return str
    .replace(/\\u003C/g, '<') // Unescape less-than sign
    .replace(/\\u003E/g, '>') // Unescape greater-than sign
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r') // Unescape carriage returns
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

/**
 * Extracts the inner code from templated blocks.
 *
 * This function takes an array of templated blocks and extracts only the inner code within the braces.
 *
 * @param {string[]} templBlocks - An array of strings, each containing a full templated block.
 * @returns {string[]} An array of strings, each containing only the inner code of the templated block.
 *
 * @example
 * const templBlocks = [
 *   "package main\\n\\nimport (\\n\\"fmt\\"\\n\\"log\\"\\n)\\ntempl AlertDemo() {\\n\\t@alertCss()\\n\\t@alert(\\"Success\\", \\"Files were successfully uploaded\\")\\n}"
 * ];
 * const result = extractInnerCode(templBlocks);
 * console.log(result);
 * // Output:
 * // [
 * //   "@alertCss()\\n  @alert(\\"Success\\", \\"Files were successfully uploaded\\")"
 * // ]
 */
export function extractInnerCode(templBlocks: string[]): string[] {
  return templBlocks.map((block) => {
    const startIndex = block.indexOf('{') + 1;
    const endIndex = block.lastIndexOf('}');
    return block.slice(startIndex, endIndex).trim();
  });
}
