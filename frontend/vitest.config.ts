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
  },
})
