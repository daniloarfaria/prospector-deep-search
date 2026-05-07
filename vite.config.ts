import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/proxy/rdap': {
          target: 'https://rdap.registro.br',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxy\/rdap/, ''),
        },
        '/proxy/cnpjws': {
          target: 'https://publica.cnpj.ws',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxy\/cnpjws/, ''),
        },
        '/proxy/casadados': {
          target: 'https://api.casadosdados.com.br',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxy\/casadados/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (env.CASA_DADOS_API_KEY) {
                proxyReq.setHeader('api-key', env.CASA_DADOS_API_KEY);
              }
            });
          },
        },
      },
    },
  };
});
