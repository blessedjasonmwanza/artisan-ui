import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/vendor/artisan-ui/',
  build: {
    outDir: path.resolve(__dirname, '../resources/dist'),
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      output: {
        entryFileNames: 'index.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
      onwarn(warning, warn) {
        // Skip certain warnings
        if (warning.code === 'THIS_IS_UNDEFINED') return
        warn(warning)
      },
    },
  },
  define: {
    __VITE_BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
})
