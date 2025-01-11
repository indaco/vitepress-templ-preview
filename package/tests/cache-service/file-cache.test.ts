import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fsp from 'node:fs/promises';
import { FileCache } from '../../src/plugin/cache-service/file-cache';

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn(),
  readFile: vi.fn(),
}));

describe('FileCache', () => {
  let fileCache: FileCache;

  beforeEach(() => {
    // Set max cache size to 3 for easier testing
    fileCache = new FileCache(3);
    // Reset all mocked function calls and state before each test
    vi.clearAllMocks();
  });

  it('should add and retrieve cached file content', async () => {
    await fileCache.updateCacheForFile('/path/to/file1.html', 'File 1 content');
    const content = fileCache.getCacheContent(
      '/path/to/file1.html',
      'default content',
    );
    expect(content).toBe('File 1 content');
  });

  it('should return default content if file is not cached', () => {
    const content = fileCache.getCacheContent(
      '/path/to/nonexistent.html',
      'default content',
    );
    expect(content).toBe('default content');
  });

  it('should evict the oldest entry when cache size exceeds the maximum limit', async () => {
    await fileCache.updateCacheForFile('/path/to/file1.html', 'File 1 content');
    await fileCache.updateCacheForFile('/path/to/file2.html', 'File 2 content');
    await fileCache.updateCacheForFile('/path/to/file3.html', 'File 3 content');
    await fileCache.updateCacheForFile('/path/to/file4.html', 'File 4 content'); // This should evict file1

    const content1 = fileCache.getCacheContent(
      '/path/to/file1.html',
      'default content',
    );
    const content4 = fileCache.getCacheContent(
      '/path/to/file4.html',
      'default content',
    );
    expect(content1).toBe('default content'); // File 1 should be evicted
    expect(content4).toBe('File 4 content'); // File 4 should be cached
  });

  it('should clear all files from the cache', async () => {
    await fileCache.updateCacheForFile('/path/to/file1.html', 'File 1 content');
    await fileCache.updateCacheForFile('/path/to/file2.html', 'File 2 content');

    fileCache.clearCache();
    const content = fileCache.getCacheContent(
      '/path/to/file1.html',
      'default content',
    );
    expect(content).toBe('default content');
    expect(fileCache['cache'].size).toBe(0);
  });

  it('should save the cache to a file', async () => {
    await fileCache.updateCacheForFile('/path/to/file1.html', 'File 1 content');
    await fileCache.updateCacheForFile('/path/to/file2.html', 'File 2 content');

    const filePath = '/path/to/cache-file.json';
    await fileCache.saveCacheToFile(filePath);

    expect(fsp.writeFile).toHaveBeenCalledWith(
      filePath,
      JSON.stringify(Array.from(fileCache['cache'].entries())),
      'utf8',
    );
  });

  it('should load the cache from a file', async () => {
    const mockData = JSON.stringify([
      ['/path/to/file1.html', { content: 'File 1 content' }],
      ['/path/to/file2.html', { content: 'File 2 content' }],
    ]);

    vi.mocked(fsp.readFile).mockResolvedValueOnce(mockData);

    await fileCache.loadCacheFromFile('/path/to/cache-file.json');

    const content1 = fileCache.getCacheContent(
      '/path/to/file1.html',
      'default content',
    );
    const content2 = fileCache.getCacheContent(
      '/path/to/file2.html',
      'default content',
    );

    expect(content1).toBe('File 1 content');
    expect(content2).toBe('File 2 content');
  });

  it('should handle errors when loading an invalid cache file', async () => {
    vi.mocked(fsp.readFile).mockRejectedValueOnce(new Error('File not found'));

    await expect(
      fileCache.loadCacheFromFile('/path/to/invalid-cache-file.json'),
    ).rejects.toThrow('File not found');
  });
});
