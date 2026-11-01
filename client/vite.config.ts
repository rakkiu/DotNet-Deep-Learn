import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          curriculum: ["./src/data/theory.json", "./src/data/articles/index.ts"],
          react: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
