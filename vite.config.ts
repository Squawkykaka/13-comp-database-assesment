import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import postcssNesting from "postcss-nesting";
import postcssImport from "postcss-import";
export default defineConfig({
  plugins: [svelte()],
  css: {
    postcss: {
      plugins: [postcssNesting(), postcssImport()],
    },
  },
  base: "/13-comp-database-assesment",
  build: {
    target: "es2015",
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              test: /node_modules\/firebase\/auth/,
              name: "auth",
            },
            {
              test: /node_modules\/firebase\/database/,
              name: "realtime",
            },
            {
              test: /node_modules\/firebase\/firestore/,
              name: "firestore",
            },
          ],
        },
      },
    },
  },
});
