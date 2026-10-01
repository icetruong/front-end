
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    host: true,          // test trên điện thoại
    proxy: {
      '/poke-api': {
        target: 'https://pokeapi.co/api/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/poke-api/, '')
      }
    }
  },
  build: {
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});