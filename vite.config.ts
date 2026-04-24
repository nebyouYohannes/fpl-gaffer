import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // When you fetch from '/api-fpl', Vite will redirect it to the FPL site
      "/api-fpl": {
        target: "https://fantasy.premierleague.com/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-fpl/, ""),
      },
    },
  },
});
