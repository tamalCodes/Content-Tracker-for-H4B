import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import globals from "globals";

export default [
  {
    ignores: ["dist", "vite.config.ts"],
  },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: { react: { version: "19.0" } },
    plugins: {
      react,
      import: importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,

      "react/jsx-no-target-blank": "off",
      "react/prop-types": "off",

      "no-unused-vars": "error",
      "no-undef": "error",
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      "no-use-before-define": ["error", { functions: false, classes: true }],
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "no-trailing-spaces": "error",
      "no-lonely-if": "error",
      "no-else-return": ["error", { allowElseIf: false }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "array-callback-return": "error",
      curly: ["error", "all"],
      "object-curly-spacing": ["error", "always"],
      "key-spacing": ["error", { beforeColon: false, afterColon: true }],
      "semi-spacing": ["error", { before: false, after: true }],
      "no-fallthrough": "error",
      "default-case": "error",
      yoda: ["error", "never"],
      "import/prefer-default-export": "error",
      "no-empty-function": "error",
      "require-await": "error",
    },
  },
];
