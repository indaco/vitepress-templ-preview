/* eslint-disable @typescript-eslint/no-explicit-any */
import { FileCache } from './file-cache';
import * as fsp from 'node:fs/promises';
import path from 'node:path';
import { UserMessages } from '../messages';
import { Logger } from '../logger';

/**
 * Monitor directories, updates the cache for HTML and templ files, and supports recursive traversal.
 */
export class FileWatcher {
  private fileCache: FileCache;

  /**
   * Creates an instance of FileWatcher.
   *
   * @param {FileCache} fileCache - The cache system to update when files are read.
   */
  constructor(fileCache: FileCache) {
    this.fileCache = fileCache;
  }

  /**
   * Recursively updates the cache for all HTML and templ files in a specified directory.
   *
   * @param {string} directory - The directory to scan and update the cache for.
   * @returns {Promise<void>} - A promise that resolves when the cache has been updated.
   */
  async updateCacheForDirectory(directory: string): Promise<void> {
    try {
      const files = await fsp.readdir(directory, { recursive: true });
      await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(directory, file);
          if (filePath.endsWith('.templ') || filePath.endsWith('.html')) {
            const content = await fsp.readFile(filePath, 'utf8');
            // Update the cache using FileCache's method
            await this.fileCache.updateCacheForFile(filePath, content);
          }
        }),
      );
    } catch (err: any) {
      Logger.error(UserMessages.READING_DIR_ERROR, err.message);
    }
  }
}
