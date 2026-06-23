import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base: './'` produces relative asset paths so the build in dist/ can be
// opened from any static server (or sub-path) and works fully offline.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 7777,
    host: true,
  },
  preview: {
    port: 7777,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
