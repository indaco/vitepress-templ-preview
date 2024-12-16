import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      enabled: true,
      provider: 'istanbul',
      reporter: ['html'],
      extension: ['.ts'],
      exclude: ['./*.ts', 'src/components/**', 'src/plugin/**'],
    },
  },
});
