import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deploy alvo: GitHub Pages project site -> https://tresporumdigital.github.io/saas-canaa/
export default defineConfig({
  base: '/saas-canaa/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
