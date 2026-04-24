import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'

const sharedLayoutRoot = path.resolve(__dirname, '../packages/maya-shared-layout-react')
const sharedSidebarRoot = path.resolve(__dirname, '../packages/maya-shared-sidebar-react')

// https://vite.dev/config/
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
  plugins: [react(), tailwindcss()],
  server: {
    fs: {
      allow: ['..', sharedLayoutRoot, sharedSidebarRoot]
    },
    watch: {
      usePolling: true,
    }
  },
  optimizeDeps: {
    include: ['keycloak-js', 'axios'],
    exclude: ['@maya/shared-auth-react', '@maya/shared-layout-react', '@maya/shared-sidebar-react']
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
    preserveSymlinks: true,
    alias: {
      'react': fileURLToPath(new URL('./node_modules/react', import.meta.url)),
      'react-dom': fileURLToPath(new URL('./node_modules/react-dom', import.meta.url)),
      'react-router-dom': fileURLToPath(new URL('./node_modules/react-router-dom', import.meta.url)),
      '@maya/shared-auth-react': fileURLToPath(
        new URL('./node_modules/@maya/shared-auth-react/src/index.ts', import.meta.url)
      ),
      '@maya/shared-layout-react': path.join(sharedLayoutRoot, 'src/index.ts'),
      '@maya/shared-sidebar-react': path.join(sharedSidebarRoot, 'src/index.ts')
    }
  }
})
