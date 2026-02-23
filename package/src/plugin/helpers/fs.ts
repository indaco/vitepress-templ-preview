import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Recursively reads all subdirectories from the specified directory.
 * Gracefully handles race conditions (e.g., directories removed during traversal).
 * @param {string} dir - The directory to read.
 * @returns {string[]} - Array of all directories including the root directory.
 */
export function readDirectoriesRecursive(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const stack = [dir];
  const results: string[] = [];

  while (stack.length) {
    const currentDir = stack.pop()!;
    results.push(currentDir);

    let entries: string[];
    try {
      entries = fs.readdirSync(currentDir);
    } catch {
      // Directory may have been removed between listing and reading
      continue;
    }

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry);
      try {
        if (fs.statSync(entryPath).isDirectory()) {
          stack.push(entryPath);
        }
      } catch {
        // Entry may have been removed between readdir and stat
        continue;
      }
    }
  }

  return results;
}
