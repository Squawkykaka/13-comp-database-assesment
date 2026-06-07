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
    minify: "terser",
    terserOptions: {
      compress: {
        passes: 2,
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug", "console.warn"],
      },

      mangle: {
        properties: {
          regex: /^_/,
        },
      },

      format: {
        comments: true,
      },
    },
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              test: /node_modules\/firebase/,
              name: "libs",
            },
          ],
        },
      },
    },
  },
});
