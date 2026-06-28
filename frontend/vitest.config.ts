import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    // Vitest 4: poolOptions se aplana — pool sigue como top-level + nuevas
    // opciones top-level (maxWorkers, minWorkers). Single fork serializa la
    // suite para mantener heap bajo en contenedor con mem_limit.
    pool: 'forks',
    maxWorkers: 1,
    minWorkers: 1,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/test/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        // Locale files are constant-object dictionaries with no branch logic;
        // excluding them gives an accurate picture of business-logic coverage.
        'src/shared/i18n/locales/**',
      ],
    },
  },
})
