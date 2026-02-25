import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json", "lcov"],
      reportOnFailure: true,
      include: ["src/components/**", "src/hooks/**", "src/utils/**", "src/parsers/**"],
      exclude: ["**/*.test.tsx", "**/*.test.ts", "**/*.stories.tsx", "src/test/**"],
    },
  },
});
