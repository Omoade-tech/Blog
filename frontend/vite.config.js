import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    sourcemap: true,
    outDir: 'dist'
  },
  define: {
    // This will make environment variables available in your app
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://blogpost-api.onrender.com')
  }
})