import { defineConfig } from "vite";
import path from 'path';

export default defineConfig({
    base: "./",
    build: {
        minify: "terser",
    },
    resolve: {
        alias: {
          '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
        }
      },
})