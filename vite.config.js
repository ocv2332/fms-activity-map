import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'https://api.citydrive.ru',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            },
            '/fms': {
                target: 'https://fms.citydrive.ru',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/fms/, '')
            }
        }
    }
})