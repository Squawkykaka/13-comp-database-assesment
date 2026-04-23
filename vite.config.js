import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  publicDir: "../public",
  build: {
    target: "es2015",
    rolldownOptions: {
      input: {
        login: resolve(__dirname, "/login.html"),
        lobby: resolve(__dirname, "/lobby.html"),
        gtn: resolve(__dirname, "/games/gtn.html"),
      },
    },
    minify: "oxc",

    outDir: "../dist",
    emptyOutDir: true,
  },
  server: { hmr: true, watch: { usePolling: true } },
});
