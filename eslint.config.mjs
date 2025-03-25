// Remove these imports from your config:
import { configs } from "eslint-plugin-jsdoc"; // Not needed
import { configs as pluginReact } from "eslint-plugin-react"; // Incorrect import

// Corrected config:
import { defineConfig } from "eslint/config";
import { configs as tseslint } from "@typescript-eslint/eslint-plugin";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      "@typescript-eslint": tseslint
    },
    extends: [
      "plugin:@typescript-eslint/recommended",
      "js/recommended"
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
