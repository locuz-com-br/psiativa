import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import remarkGfm from 'remark-gfm';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://psiativa.com.br',
  markdown: {
    // Without this, GFM tables in .mdx render as literal pipe text (hit on the
    // /apps/n8n and /privacidade/dm-triggers policy tables).
    remarkPlugins: [remarkGfm],
  },
  integrations: [
    react(),
    mdx(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
