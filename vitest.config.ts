import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: fileURLToPath(new URL("./vitest.setup.ts", import.meta.url)),
    include: ["{tests,__tests__}/**/*.{test,spec}.{ts,tsx}", "**/*.spec.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
