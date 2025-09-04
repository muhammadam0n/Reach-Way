import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          ui: ['@mui/material', 'antd', 'react-icons']
        }
      }
    }
  },
  server: {
    port: 3001,
    host: true,
    allowedHosts: ['fd611be70a2d.ngrok-free.app', '.ngrok-free.app']
  },
  preview: {
    port: 4173,
    host: true
  }
})
