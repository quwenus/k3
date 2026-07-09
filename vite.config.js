import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const copyProductImages = () => ({
  name: 'copy-product-images',
  closeBundle() {
    const sourceDir = path.resolve(__dirname, 'src/assets/img')
    const targetDir = path.resolve(__dirname, 'dist/assets/img')

    if (fs.existsSync(sourceDir)) {
      fs.cpSync(sourceDir, targetDir, { recursive: true })
    }
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), copyProductImages()],
  server: {
    proxy: {
      '/api': 'http://localhost:5001',
      '/assets': 'http://localhost:5001'
    }
  }
})
