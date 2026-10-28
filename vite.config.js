// Este arquivo configura a ferramenta Vite; ele não é um componente da interface.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// defineConfig facilita a leitura e as sugestões de configuração no editor.
export default defineConfig({
  // Habilita a integração com React e a atualização rápida durante o desenvolvimento.
  plugins: [react()],
  // Gera referências relativas para os arquivos do build.
  // O exemplo de fetch usa import.meta.env.BASE_URL para acompanhar essa configuração.
  base: './',
  // Inclui a página principal e o modelo independente no build de produção.
  build: {
    rolldownOptions: {
      input: {
        caderno: fileURLToPath(new URL('./index.html', import.meta.url)),
        modelo: fileURLToPath(new URL('./modelo.html', import.meta.url)),
      },
    },
  },
});
