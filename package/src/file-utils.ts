/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fsp from 'node:fs/promises';
import path from 'node:path';
import { Logger } from './logger';
import { UserMessages } from './user-messages';

export interface CachedFile {
  content: string;
}

/**
 * Manage in-memory caching of file content with size limits and persistence features.
 */
export class FileCache {
  private cache: Map<string, CachedFile> = new Map();
  private maxCacheSize: number;

  /**
   * Creates an instance of FileCache.
   *
   * @param {number} maxCacheSize - The maximum number of files to cache. Defaults to 100.
   */
  constructor(maxCacheSize: number = 100) {
    this.maxCacheSize = maxCacheSize;
  }

  /**
   * Updates the cache with the content of a specific file.
   *
   * @param {string} filePath - The path of the file to cache.
   * @param {string} content - The content to store in the cache.
   */
  async updateCacheForFile(filePath: string, content: string) {
    this.cache.set(filePath, { content });
    this.checkCacheSize();
  }

  /**
   * Retrieves the cached content for a given file, or returns default content if the file is not cached.
   *
   * @param {string} filePath - The path of the file to retrieve from the cache.
   * @param {string} defaultContent - The content to return if the file is not found in the cache.
   * @returns {string} - The cached content or the default content.
   */
  getCacheContent(filePath: string, defaultContent: string): string {
    const cachedFile = this.cache.get(filePath);
    if (cachedFile) {
      return cachedFile.content;
    }
    return defaultContent;
  }

  /**
   * Ensures the cache size does not exceed the specified maximum by removing the oldest entries.
   */
  private checkCacheSize(): void {
    if (this.cache.size > this.maxCacheSize) {
      const oldestEntry = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestEntry);
    }
  }

  /**
   * Clears all files from the cache.
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Saves the current cache to a file on disk.
   *
   * @param {string} filePath - The path to save the cache file.
   * @returns {Promise<void>} - A promise that resolves when the cache is saved.
   */
  async saveCacheToFile(filePath: string): Promise<void> {
    const serializedCache = JSON.stringify(Array.from(this.cache.entries()));
    await fsp.writeFile(filePath, serializedCache, 'utf8');
  }

  /**
   * Loads a cache from a file on disk and populates the in-memory cache.
   *
   * @param {string} filePath - The path of the cache file to load.
   * @returns {Promise<void>} - A promise that resolves when the cache is loaded.
   */
  async loadCacheFromFile(filePath: string): Promise<void> {
    const data = await fsp.readFile(filePath, 'utf8');
    const entries = JSON.parse(data);
    this.cache = new Map(entries);
  }
}

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

/**
 * Handle module invalidation in the Vite server and tracks watched files for changes.
 */
export class ModuleInvalidator {
  private watchedFiles: Map<string, Set<string>>;

  /**
   * Creates an instance of ModuleInvalidator.
   *
   * @param {Map<string, Set<string>>} [watchedFiles] - Optional initial set of watched files.
   */
  constructor(watchedFiles?: Map<string, Set<string>>) {
    this.watchedFiles = watchedFiles || new Map();
  }

  /**
   * Invalidates Vite server modules for all tracked files.
   *
   * @param {any} server - The Vite server instance.
   */
  invalidateModules(server: any): void {
    for (const fileSet of this.watchedFiles.values()) {
      fileSet.forEach((mdFile) => {
        const module = server.moduleGraph.getModuleById(mdFile);
        if (module) {
          server.moduleGraph.invalidateModule(module);
        }
      });
    }

    server.ws.send({
      type: 'full-reload',
    });
  }

  /**
   * Adds a file to the watch list and associates it with a given id.
   *
   * @param {string} filePath - The path of the file to watch.
   * @param {string} id - The identifier for the file.
   */
  addFile(filePath: string, id: string): void {
    if (!this.watchedFiles.has(filePath)) {
      this.watchedFiles.set(filePath, new Set());
    }
    this.watchedFiles.get(filePath)?.add(id);
  }

  /**
   * Clears all tracked watched files.
   */
  clearWatchedFiles(): void {
    this.watchedFiles.clear();
  }
}
