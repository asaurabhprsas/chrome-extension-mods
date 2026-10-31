import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@chrome-mods/core": path.resolve(__dirname, "packages/core/src/index.ts")
    }
  },
  test: {
    environment: "node"
  }
});
