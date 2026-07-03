// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeFigure from './src/lib/rehype-figure';

export default defineConfig({
  site: 'https://thereducingvalve.com',
  trailingSlash: 'never',
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: [rehypeFigure],
  },
  build: {
    // file format serves /about from about.html on Pages without a 308
    // to /about/ — keeps served URLs identical to the canonical tags.
    format: 'file',
    inlineStylesheets: 'auto',
  },
});
