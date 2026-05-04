import { defineConfig } from "vite";
import postcssNesting from "postcss-nesting";
import postcssImport from "postcss-import";
export default defineConfig({
  css: {
    postcss: {
      plugins: [postcssNesting(), postcssImport()],
    },
    devSourcemap: true,
  },
  base: "/13-comp-database-assesment",
  build: {
    target: "es2015",
    rolldownOptions: {
      input: ['index.html', 'game.html']
    },
  },
});
