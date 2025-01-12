/* eslint-disable @typescript-eslint/no-explicit-any */
import * as path from 'node:path';
import { Logger } from '../logger';
import type { VTPMessage } from '../types';
import { UserMessages } from '../messages';
import { PluginConfig } from '../../types';
import { ViteDevServer } from 'vite';
import { FileCache } from './file-cache';
import { FileWatcher } from './file-watcher';
import { ModuleInvalidator } from './invalidator';

/**
 * Service to coordinate file caching, directory watching, and module invalidation.
 * Provides methods to manage file caching and handle file changes in Vite server.
 */
export class CacheService {
  private fileCache: FileCache;
  private fileWatcher: FileWatcher;
  private moduleInvalidator: ModuleInvalidator;

  /**
   * Creates an instance of CacheService with a specified cache size.
   *
   * @param {number} [maxCacheSize=100] - The maximum number of files to cache. Defaults to 100.
   */
  constructor(maxCacheSize: number = 100) {
    this.fileCache = new FileCache(maxCacheSize);
    this.fileWatcher = new FileWatcher(this.fileCache);
    this.moduleInvalidator = new ModuleInvalidator(new Map());
  }

  /**
   * Updates the cache for specified directories and invalidates Vite modules.
   * It handles HTML and templ file caching and triggers module reloading in Vite.
   *
   * @param {any} server - The Vite server instance.
   * @param {string} serverRoot - The root directory of the server.
   * @param {PluginConfig} finalOptions - The plugin configuration options.
   * @param {boolean} [isFirstServerRun=true] - Indicates if this is the first run of the server. Defaults to true.
   * @returns {Promise<void>} - A promise that resolves when the cache is updated and modules are invalidated.
   */
  async updateCacheAndInvalidate(
    server: any,
    serverRoot: string,
    finalOptions: PluginConfig,
    isFirstServerRun: boolean = true,
  ): Promise<void> {
    // Resolve paths
    const resolvedFinalOptions: Partial<PluginConfig> = {
      goProjectDir: finalOptions.goProjectDir,
      inputDir: path.join(finalOptions.goProjectDir, finalOptions.inputDir!),
      outputDir: path.join(finalOptions.goProjectDir, finalOptions.outputDir!),
    };

    const templResolvedPath = path.resolve(
      serverRoot,
      resolvedFinalOptions.inputDir!,
    );

    let htmlResolvedPath = '';

    const dir =
      finalOptions.mode === 'bundle'
        ? resolvedFinalOptions.outputDir
        : finalOptions.mode === 'inline'
          ? resolvedFinalOptions.inputDir
          : null;

    if (dir) {
      htmlResolvedPath = path.resolve(serverRoot, dir);
    }

    // Watch .templ files on first server run
    if (isFirstServerRun) {
      Logger.info(UserMessages.WATCHING_FILES, templResolvedPath);
      server.watcher.add(path.join(templResolvedPath, '**', '*.templ'));
    }

    // Update cache and invalidate modules for both paths
    await this.fileWatcher.updateCacheForDirectory(htmlResolvedPath);
    await this.fileWatcher.updateCacheForDirectory(templResolvedPath);

    this.moduleInvalidator.invalidateModules(server);

    // Send full-reload to the server's WebSocket
    server.ws.send({
      type: 'full-reload',
    });
  }

  /**
   * Adds a file to be watched for changes and associates it with an ID.
   *
   * @param {string} filePath - The path of the file to watch.
   * @param {string} id - The identifier associated with the file.
   */
  watchFileChanges(filePath: string, id: string): void {
    this.moduleInvalidator.addFile(filePath, id);
  }

  /**
   * Handles a file change event with an optional delay before sending reload events.
   * @param server - Vite's Dev Server instance.
   * @param file - The file path that triggered the change.
   * @param delay - Delay in milliseconds before handling the file change.
   */
  public handleFileChange(
    server: ViteDevServer,
    file: string,
    delay: number = 500,
  ): void {
    setTimeout(() => {
      this.watchFileChanges(file, file);

      // Send a full-reload event to the client
      server.ws.send({
        type: 'full-reload',
      });
    }, delay);

    Logger.info(<VTPMessage>{
      headline: 'Cache updated and client reloaded for file:',
      message: file,
    });
  }
  /**
   * Clears the entire file cache.
   */
  clearCache(): void {
    this.fileCache.clearCache();
  }

  /**
   * Retrieves the cached content of a file or returns default content if the file is not cached.
   *
   * @param {string} filePath - The path of the file to retrieve from the cache.
   * @param {string} defaultContent - The content to return if the file is not found in the cache.
   * @returns {string} - The cached content or the default content.
   */
  getCachedContent(filePath: string, defaultContent: string): string {
    return this.fileCache.getCacheContent(filePath, defaultContent);
  }

  /**
   * Saves the current state of the cache to a file on disk.
   *
   * @param {string} filePath - The path where the cache should be saved.
   * @returns {Promise<void>} - A promise that resolves when the cache is saved.
   */
  async saveCacheToFile(filePath: string): Promise<void> {
    await this.fileCache.saveCacheToFile(filePath);
  }

  /**
   * Loads a previously saved cache from a file on disk and populates the in-memory cache.
   *
   * @param {string} filePath - The path of the file from which to load the cache.
   * @returns {Promise<void>} - A promise that resolves when the cache is loaded.
   */
  async loadCacheFromFile(filePath: string): Promise<void> {
    await this.fileCache.loadCacheFromFile(filePath);
  }
}
