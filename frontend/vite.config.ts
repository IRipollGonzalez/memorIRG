import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Dev-mode proxy: /api/* -> the FastAPI dev server, so frontend fetch calls
// work identically to packaged mode (where one process serves both). The
// "static" mode (npm run build:static) targets GitHub Pages project-site
// hosting instead — served from /memorIRG/, not the domain root — and never
// hits /api at all (see src/lib/env.ts's IS_STATIC).
export default defineConfig(({ mode }) => ({
  base: mode === "static" ? "/memorIRG/" : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
}));
