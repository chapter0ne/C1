import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          utils: ['@tanstack/react-query', 'date-fns', 'zod']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: mode === 'development'
  },
  worker: {
    format: 'es'
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
    exclude: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
  },
  define: {
    __DEV__: mode === 'development'
  }
}));
