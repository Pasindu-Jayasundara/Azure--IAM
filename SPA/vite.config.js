import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
        rollupOptions: {
            input: {
                main: resolve(import.meta.dirname, "index.html"),
                redirect: resolve(import.meta.dirname, "redirect.html"),
            },
        },
    }, 
})
