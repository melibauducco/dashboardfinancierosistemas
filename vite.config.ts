import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANTE: Cambia 'dashboard-financiero' por el nombre de tu repositorio en GitHub
  base: '/dashboard-financiero/',
})
