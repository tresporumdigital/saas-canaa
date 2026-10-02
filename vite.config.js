import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deploy alvo: Hostinger -> https://backoffice.funerariacanaa.com/
// `base` relativo: assets referenciados como ./assets/... (funciona na raiz do subdomínio).
export default defineConfig({
  base: './',
  plugins: [react()],
  // Só no `npm run dev`: encaminha /api para a API publicada (não há PHP local).
  server: {
    proxy: {
      '/api': { target: 'https://backoffice.funerariacanaa.com', changeOrigin: true, secure: true },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
