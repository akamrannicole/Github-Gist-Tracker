import { defineConfig } from "eslint/config";
import { globals } from "globals";
import { js } from "@eslint/js";
import { configs } from "eslint-plugin-jsdoc";
import { configs as tseslint } from "@typescript-eslint/eslint-plugin";
import { configs as pluginReact } from "eslint-plugin-react";

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
      js: js,
      "@typescript-eslint": tseslint,
      react: pluginReact
    },
    extends: [
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "plugin:jsdoc/recommended",
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
