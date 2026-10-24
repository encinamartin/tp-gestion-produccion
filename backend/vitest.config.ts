import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 40,
        lines: 40,
        functions: 40,
        branches: 40,
      },
      exclude: [
        'node_modules/',
        'dist/',
        'src/types/',
        'src/utils/seed.ts',
        'vitest.config.ts',
      ],
    },
  },
});