import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'

const sharedLayoutRoot = path.resolve(__dirname, '../packages/maya-shared-layout-react')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    fs: {
      allow: ['..', sharedLayoutRoot]
    },
    watch: {
      usePolling: true,
    }
  },
  optimizeDeps: {
    include: ['keycloak-js', 'axios'],
    exclude: ['@maya/shared-layout-react']
  },
  resolve: {
    alias: {
      '@maya/shared-auth-react': fileURLToPath(
        new URL('./node_modules/@maya/shared-auth-react/src/index.ts', import.meta.url)
      ),
      '@maya/shared-layout-react': path.join(sharedLayoutRoot, 'src/index.ts')
    }
  }
})
