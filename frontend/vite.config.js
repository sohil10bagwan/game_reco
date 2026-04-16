import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    extensions: ['.jsx', '.js', '.json']
  },
  server: {
    port: 5173
  }
})
