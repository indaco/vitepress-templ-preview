import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkBinaries, executeCommand } from '../../src/plugin/helpers/os';
import { Logger } from '../../src/plugin/logger';
import { platform } from 'os';
import { spawnSync, execFileSync } from 'node:child_process';
import type { Command } from '../../src/plugin/command-builder';

// Correctly mock os, child_process, and logger modules using Vitest's recommendations
vi.mock('os', () => ({
  platform: vi.fn(),
}));

vi.mock('node:child_process', () => ({
  spawnSync: vi.fn(),
  execFileSync: vi.fn(),
}));

vi.mock('../../src/plugin/logger', async () => {
  const actual = await vi.importActual('../../src/plugin/logger');
  return {
    ...actual,
    Logger: {
      info: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe('checkBinaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully check for binaries on a non-Windows system', () => {
    vi.mocked(platform).mockReturnValue('linux');
    vi.mocked(spawnSync).mockReturnValue({ status: 0 } as ReturnType<
      typeof spawnSync
    >);

    checkBinaries(['node', 'npm']);

    expect(spawnSync).toHaveBeenCalledWith('which', ['node']);
    expect(spawnSync).toHaveBeenCalledWith('which', ['npm']);
    expect(Logger.error).not.toHaveBeenCalled();
  });

  it('should successfully check for binaries on Windows system', () => {
    vi.mocked(platform).mockReturnValue('win32');
    vi.mocked(spawnSync).mockReturnValue({ status: 0 } as ReturnType<
      typeof spawnSync
    >);

    checkBinaries(['node', 'npm']);

    expect(spawnSync).toHaveBeenCalledWith('where', ['node']);
    expect(spawnSync).toHaveBeenCalledWith('where', ['npm']);
    expect(Logger.error).not.toHaveBeenCalled();
  });

  it('should throw an error if a binary is not found', () => {
    vi.mocked(platform).mockReturnValue('linux');
    vi.mocked(spawnSync).mockReturnValue({ status: 1 } as ReturnType<
      typeof spawnSync
    >);

    expect(() => checkBinaries(['nonexistent-binary'])).toThrowError(
      '[vitepress-templ-preview] Command Not Found: The specified command is not installed or was not found in the system PATH. "nonexistent-binary"',
    );

    expect(Logger.error).toHaveBeenCalledWith(
      expect.anything(),
      'nonexistent-binary',
    );
  });
});

describe('executeCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute a structured command and log the output', () => {
    vi.mocked(execFileSync).mockReturnValue(Buffer.from('command output'));

    const cmd: Command = { bin: 'echo', args: ['hello'], cwd: '/tmp' };
    executeCommand(cmd);

    expect(execFileSync).toHaveBeenCalledWith('echo', ['hello'], {
      cwd: '/tmp',
      stdio: 'pipe',
    });
    expect(Logger.info).toHaveBeenCalledWith({ message: 'command output' });
  });

  it('should handle errors thrown by execFileSync', () => {
    const error = new Error('command failed');
    vi.mocked(execFileSync).mockImplementation(() => {
      throw Object.assign(error, { stderr: Buffer.from('error details') });
    });

    const cmd: Command = { bin: 'false', args: [], cwd: '/tmp' };
    expect(() => executeCommand(cmd)).toThrowError('command failed');

    expect(Logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        headline: 'Command Execution Error',
        message:
          'An error occurred while executing the system command. Check for system errors or missing binaries.',
      }),
      'command failed',
    );

    expect(Logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        headline: 'Error',
        message: 'An unexpected error occurred. Please try again later.',
      }),
      'error details',
    );
  });

  it('should handle execFileSync without stdout', () => {
    vi.mocked(execFileSync).mockReturnValue(Buffer.from(''));

    const cmd: Command = { bin: 'echo', args: ['hello'], cwd: '/tmp' };
    executeCommand(cmd);

    expect(Logger.info).not.toHaveBeenCalledWith({ message: '' });
  });
});
