import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "storybook-static/**",
      "node_modules/**",
      "*.config.js",
      "*.config.ts",
    ],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // React recommended (flat config)
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],

  // React Hooks
  reactHooks.configs["recommended-latest"],

  // Project-specific overrides
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // Relax rules that conflict with TypeScript strict mode
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Allow explicit any sparingly (warn instead of error)
      "@typescript-eslint/no-explicit-any": "warn",

      // Allow empty interfaces/type aliases for extending
      "@typescript-eslint/no-empty-object-type": "off",

      // Allow non-null assertions (common in tests and D3 code)
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
);
