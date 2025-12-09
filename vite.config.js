import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const FUNCTIONS_PROXY_PATH = process.env.VITE_FUNCTIONS_PROXY_PATH || ''
const FUNCTIONS_PROXY_TARGET =
  process.env.VITE_FUNCTIONS_PROXY_TARGET ||
  process.env.VITE_FUNCTIONS_BASE_URL ||
  'https://us-central1-cookie1-b3592.cloudfunctions.net'

const buildProxyConfig = () => {
  if (!FUNCTIONS_PROXY_PATH) {
    return undefined
  }
  return {
    [FUNCTIONS_PROXY_PATH]: {
      target: FUNCTIONS_PROXY_TARGET,
      changeOrigin: true,
      secure: FUNCTIONS_PROXY_TARGET.startsWith('https://'),
      rewrite: (path) => path.replace(FUNCTIONS_PROXY_PATH, ''),
    }
  }
}

const proxyConfig = buildProxyConfig()

const baseServerConfig = {
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Cross-Origin-Embedder-Policy': 'unsafe-none'
  },
  ...(proxyConfig ? { proxy: proxyConfig } : {})
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: baseServerConfig,
  preview: baseServerConfig,
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'firebase'
            }
            if (id.includes('@nktkas/hyperliquid')) {
              return 'hyperliquid'
            }
            if (id.includes('lucide-react')) {
              return 'icons'
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-vendor'
            }
          }
        }
      }
    }
  }
})
