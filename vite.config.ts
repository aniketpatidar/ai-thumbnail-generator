import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.DEMO_USERNAME': JSON.stringify(env.DEMO_USERNAME),
      'process.env.DEMO_PASSWORD': JSON.stringify(env.DEMO_PASSWORD)
    },
    server: {
      proxy: {
        '/api/gemini': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/gemini/, ''),
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq) => {
              
              
              proxyReq.removeHeader('Authorization');
              
              const url = new URL(proxyReq.path, 'https://generativelanguage.googleapis.com');
              url.searchParams.append('key', process.env.GEMINI_API_KEY || '');
              proxyReq.path = `${url.pathname}${url.search}`;
            });
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
