import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative paths so the built app works at a domain root or under a subpath (e.g. GitHub Pages).
  base: './',
})
