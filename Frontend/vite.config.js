import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import plugin from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [plugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      // http://localhost:5173/Search
      //   -> http://localhost:5091/Search
      "/Search": {
        target: "http://localhost:5091",
        changeOrigin: true,
      },
    },
  },
});
