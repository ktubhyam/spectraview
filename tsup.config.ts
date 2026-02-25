import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: true,
    external: ["react", "react-dom", "react/jsx-runtime"],
    esbuildOptions(options) {
      options.banner = {
        js: '"use client";',
      };
    },
  },
  {
    entry: ["src/parsers/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    outDir: "dist/parsers",
    external: ["react", "react-dom", "react/jsx-runtime"],
  },
]);
