import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Esto permite que el servidor sea accesible desde la red local
    allowedHosts: ['localhost', 'd165-2806-310-116-9a47-fdb3-f969-539c-a6c0.ngrok-free.app']
  }
})
