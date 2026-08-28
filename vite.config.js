import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deploy alvo: Hostinger -> https://backoffice.funerariacanaa.com/
// `base` relativo: assets referenciados como ./assets/... (funciona na raiz do subdomínio).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
