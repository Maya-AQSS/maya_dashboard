import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const defaultSharedAuthRoot = path.resolve(__dirname, '../packages/maya-shared-auth-react')
const sharedLayoutRoot = path.resolve(__dirname, '../packages/maya-shared-layout-react')
const sharedSidebarRoot = path.resolve(__dirname, '../packages/maya-shared-sidebar-react')
const sharedAuthRoot = process.env.SHARED_AUTH_PACKAGE_ROOT
  ? path.resolve(process.env.SHARED_AUTH_PACKAGE_ROOT)
  : defaultSharedAuthRoot

// https://vite.dev/config/
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      allow: ['..', sharedAuthRoot, sharedLayoutRoot, sharedSidebarRoot]
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
    alias: {
      '@maya/shared-auth-react': path.join(sharedAuthRoot, 'src/index.ts'),
      '@maya/shared-layout-react': path.join(sharedLayoutRoot, 'src/index.ts'),
      '@maya/shared-sidebar-react': path.join(sharedSidebarRoot, 'src/index.ts')
    }
  }
})
