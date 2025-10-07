import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    open: true, // Abre el navegador automáticamente
    proxy: {
    // Proxy para Steam Web API
    '/steam-api': {
      target: 'https://api.steampowered.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/steam-api/, ''),
      secure: false,
    },
    // Proxy para Steam Store API
    '/steam-store': {
      target: 'https://store.steampowered.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/steam-store/, ''),
      secure: false,
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'swiper'],
          'utils': ['axios', 'zustand', 'clsx']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'zustand']
  }
  })
  