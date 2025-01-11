import * as fsp from 'node:fs/promises';

/**
 * Represents a cached file with its content.
 */
interface CachedFile {
  /**
   * The content of the cached file.
   */
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
