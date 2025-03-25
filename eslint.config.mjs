import { defineConfig } from "eslint/config";
import jsdoc from "eslint-plugin-jsdoc";
import react from "eslint-plugin-react";
import tseslint from "@typescript-eslint/eslint-plugin";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        browser: true,
        node: true
      }
    },
    plugins: {
      "@typescript-eslint": tseslint,
      jsdoc,
      react
    },
    extends: [
      "plugin:@typescript-eslint/recommended",
      "plugin:jsdoc/recommended",
      "plugin:react/recommended"
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ]
    }
  }
]);
