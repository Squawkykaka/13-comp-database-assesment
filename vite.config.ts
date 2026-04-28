import { defineConfig } from "vite";
import postcssNesting from "postcss-nesting";
export default defineConfig({
  css: {
    postcss: {
      plugins: [postcssNesting()],
    },
    devSourcemap: true,
  },
  build: {
    target: "es2015",
  }
});
