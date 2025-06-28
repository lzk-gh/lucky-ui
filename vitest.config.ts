import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tools/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'apps/',
        'tools/build/',
        'tools/cli/',
        'tools/scripts/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    include: ['packages/**/__tests__/**/*.{test,spec}.{js,ts}'],
    exclude: [
      'node_modules',
      'dist',
      'apps',
      'tools/build',
      'tools/cli',
      'tools/scripts',
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './packages'),
      '@components': resolve(__dirname, './packages/components'),
      '@core': resolve(__dirname, './packages/core'),
      '@theme': resolve(__dirname, './packages/theme'),
      '@icons': resolve(__dirname, './packages/icons'),
      '@locale': resolve(__dirname, './packages/locale'),
      '@preset': resolve(__dirname, './packages/preset'),
      '@playground-components': resolve(
        __dirname,
        './packages/playground-components'
      ),
    },
  },
});
