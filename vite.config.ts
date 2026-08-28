import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/c-angkorwat/',
  plugins: [react()],
  server: {
    host: true,
  },
})
