import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import { defineConfig } from 'vite';
import { apiRouter } from './server/apiRouter.ts';

export default defineConfig(() => {
  const uploadsDir = path.resolve(process.cwd(), 'uploads');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'khmervibe-api-server',
        configureServer(server) {
          (server.middlewares as any).use('/api', apiRouter);
          (server.middlewares as any).use('/uploads', express.static(uploadsDir));
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

