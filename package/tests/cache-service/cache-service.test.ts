import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheService } from '../../src/plugin/cache-service/cache-service';

// Mock dependencies using class-based mocks so `new` works correctly.
const mockGetCacheContent = vi.fn();
const mockClearCache = vi.fn();
const mockSaveCacheToFile = vi.fn();
const mockLoadCacheFromFile = vi.fn();
const mockUpdateCacheForFile = vi.fn();

const FileCacheConstructor = vi.fn();

vi.mock('../../src/plugin/cache-service/file-cache', () => ({
  FileCache: class {
    constructor(...args: unknown[]) {
      FileCacheConstructor(...args);
    }
    getCacheContent = mockGetCacheContent;
    clearCache = mockClearCache;
    saveCacheToFile = mockSaveCacheToFile;
    loadCacheFromFile = mockLoadCacheFromFile;
    updateCacheForFile = mockUpdateCacheForFile;
  },
}));

const mockUpdateCacheForDirectory = vi.fn();

vi.mock('../../src/plugin/cache-service/file-watcher', () => ({
  FileWatcher: class {
    constructor() {}
    updateCacheForDirectory = mockUpdateCacheForDirectory;
  },
}));

const mockAddFile = vi.fn();
const mockInvalidateModules = vi.fn();
const ModuleInvalidatorConstructor = vi.fn();

vi.mock('../../src/plugin/cache-service/invalidator', () => ({
  ModuleInvalidator: class {
    constructor(...args: unknown[]) {
      ModuleInvalidatorConstructor(...args);
    }
    addFile = mockAddFile;
    invalidateModules = mockInvalidateModules;
    clearWatchedFiles = vi.fn();
  },
}));

vi.mock('../../src/plugin/logger', () => ({
  Logger: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    vi.clearAllMocks();
    cacheService = new CacheService();
  });

  afterEach(() => {
    cacheService.dispose();
  });

  // ─── Constructor ──────────────────────────────────────────────────

  describe('constructor', () => {
    it('should create an instance with default cache size', () => {
      FileCacheConstructor.mockClear();
      const service = new CacheService();
      expect(service).toBeInstanceOf(CacheService);
      expect(FileCacheConstructor).toHaveBeenCalledWith(100);
    });

    it('should create an instance with a custom cache size', () => {
      FileCacheConstructor.mockClear();
      const service = new CacheService(50);
      expect(service).toBeInstanceOf(CacheService);
      expect(FileCacheConstructor).toHaveBeenCalledWith(50);
    });

    it('should instantiate ModuleInvalidator with an empty Map', () => {
      ModuleInvalidatorConstructor.mockClear();
      new CacheService();
      expect(ModuleInvalidatorConstructor).toHaveBeenCalledWith(new Map());
    });
  });

  // ─── getCachedContent ─────────────────────────────────────────────

  describe('getCachedContent', () => {
    it('should delegate to fileCache.getCacheContent', () => {
      mockGetCacheContent.mockReturnValue('cached content');

      const result = cacheService.getCachedContent(
        '/path/to/file.html',
        'default',
      );

      expect(mockGetCacheContent).toHaveBeenCalledWith(
        '/path/to/file.html',
        'default',
      );
      expect(result).toBe('cached content');
    });

    it('should return the default content when fileCache returns it', () => {
      mockGetCacheContent.mockReturnValue('default');

      const result = cacheService.getCachedContent(
        '/path/to/missing.html',
        'default',
      );

      expect(result).toBe('default');
    });
  });

  // ─── clearCache ───────────────────────────────────────────────────

  describe('clearCache', () => {
    it('should delegate to fileCache.clearCache', () => {
      cacheService.clearCache();

      expect(mockClearCache).toHaveBeenCalledOnce();
    });
  });

  // ─── saveCacheToFile ──────────────────────────────────────────────

  describe('saveCacheToFile', () => {
    it('should delegate to fileCache.saveCacheToFile', async () => {
      mockSaveCacheToFile.mockResolvedValue(undefined);

      await cacheService.saveCacheToFile('/path/to/cache.json');

      expect(mockSaveCacheToFile).toHaveBeenCalledWith('/path/to/cache.json');
    });
  });

  // ─── loadCacheFromFile ────────────────────────────────────────────

  describe('loadCacheFromFile', () => {
    it('should delegate to fileCache.loadCacheFromFile', async () => {
      mockLoadCacheFromFile.mockResolvedValue(undefined);

      await cacheService.loadCacheFromFile('/path/to/cache.json');

      expect(mockLoadCacheFromFile).toHaveBeenCalledWith('/path/to/cache.json');
    });
  });

  // ─── watchFileChanges ─────────────────────────────────────────────

  describe('watchFileChanges', () => {
    it('should delegate to moduleInvalidator.addFile', () => {
      cacheService.watchFileChanges('/path/to/file.templ', 'module-id');

      expect(mockAddFile).toHaveBeenCalledWith(
        '/path/to/file.templ',
        'module-id',
      );
    });

    it('should pass through different file paths and ids', () => {
      cacheService.watchFileChanges('/a.templ', 'id-a');
      cacheService.watchFileChanges('/b.templ', 'id-b');

      expect(mockAddFile).toHaveBeenCalledTimes(2);
      expect(mockAddFile).toHaveBeenNthCalledWith(1, '/a.templ', 'id-a');
      expect(mockAddFile).toHaveBeenNthCalledWith(2, '/b.templ', 'id-b');
    });
  });

  // ─── handleFileChange ─────────────────────────────────────────────

  describe('handleFileChange', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should debounce and call watchFileChanges after the default delay', () => {
      cacheService.handleFileChange('/path/to/file.templ');

      // Before the timer fires, addFile should not have been called
      expect(mockAddFile).not.toHaveBeenCalled();

      // Advance past the default 500ms delay
      vi.advanceTimersByTime(500);

      expect(mockAddFile).toHaveBeenCalledWith(
        '/path/to/file.templ',
        '/path/to/file.templ',
      );
    });

    it('should debounce and call watchFileChanges after a custom delay', () => {
      cacheService.handleFileChange('/path/to/file.templ', 1000);

      // Not called at 500ms
      vi.advanceTimersByTime(500);
      expect(mockAddFile).not.toHaveBeenCalled();

      // Called after the full 1000ms
      vi.advanceTimersByTime(500);
      expect(mockAddFile).toHaveBeenCalledOnce();
    });

    it('should clear previous timer when called again before delay elapses', () => {
      cacheService.handleFileChange('/path/to/first.templ');

      // Advance partially (not enough to fire)
      vi.advanceTimersByTime(300);
      expect(mockAddFile).not.toHaveBeenCalled();

      // Call again with a different file, resetting the timer
      cacheService.handleFileChange('/path/to/second.templ');

      // Advance past the original 500ms from the first call
      vi.advanceTimersByTime(200);
      expect(mockAddFile).not.toHaveBeenCalled();

      // Advance to complete the second call's 500ms delay
      vi.advanceTimersByTime(300);
      expect(mockAddFile).toHaveBeenCalledOnce();
      expect(mockAddFile).toHaveBeenCalledWith(
        '/path/to/second.templ',
        '/path/to/second.templ',
      );
    });

    it('should set pendingTimer to null after the timeout callback fires', () => {
      cacheService.handleFileChange('/path/to/file.templ');

      // Before the timer fires, pendingTimer should be set
      expect((cacheService as any)['pendingTimer']).not.toBeNull();

      vi.advanceTimersByTime(500);

      // After the timer fires, pendingTimer should be null
      expect((cacheService as any)['pendingTimer']).toBeNull();
    });
  });

  // ─── dispose ──────────────────────────────────────────────────────

  describe('dispose', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should clear a pending timer', () => {
      // Schedule a file change to create a pending timer
      cacheService.handleFileChange('/path/to/file.templ');
      expect((cacheService as any)['pendingTimer']).not.toBeNull();

      // Dispose should clear the timer
      cacheService.dispose();
      expect((cacheService as any)['pendingTimer']).toBeNull();

      // Advancing time should not trigger the callback
      vi.advanceTimersByTime(1000);
      expect(mockAddFile).not.toHaveBeenCalled();
    });

    it('should be safe to call when no timer exists', () => {
      // pendingTimer is null by default
      expect((cacheService as any)['pendingTimer']).toBeNull();

      // Should not throw
      expect(() => cacheService.dispose()).not.toThrow();
      expect((cacheService as any)['pendingTimer']).toBeNull();
    });

    it('should be safe to call multiple times', () => {
      cacheService.handleFileChange('/path/to/file.templ');
      cacheService.dispose();
      expect(() => cacheService.dispose()).not.toThrow();
      expect((cacheService as any)['pendingTimer']).toBeNull();
    });
  });
});
