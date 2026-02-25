import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    coverage: {
      provider: "v8",
      include: ["src/components/**", "src/hooks/**", "src/utils/**", "src/parsers/**"],
      exclude: ["**/*.test.tsx", "**/*.test.ts", "**/*.stories.tsx", "src/test/**"],
    },
  },
});
