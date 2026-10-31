import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import fs from "node:fs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-manifest",
      closeBundle() {
        fs.copyFileSync(
          path.resolve(__dirname, "manifest.json"),
          path.resolve(__dirname, "dist/manifest.json")
        );
      }
    }
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
