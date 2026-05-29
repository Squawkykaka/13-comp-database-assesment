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
    sourcemap: true,
    rolldownOptions: {
      input: ["index.html", "lobby.html"],
    },
  },
});
