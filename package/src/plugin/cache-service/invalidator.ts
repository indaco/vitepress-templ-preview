/* eslint-disable @typescript-eslint/no-explicit-any */

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
