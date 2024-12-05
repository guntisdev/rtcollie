import { defineConfig } from 'vite'

export default defineConfig({
    base: '/',
    server: {
        host: true,
        port: 4444,
    },
    build: {
        target: 'esnext',
    },
})
