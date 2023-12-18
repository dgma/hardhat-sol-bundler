module.exports = {
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true,
    jest: true,
  },

  root: true,

  plugins: ["@typescript-eslint", "json", "promise", "import", "prettier"],

  extends: [
    "eslint:recommended",
    "plugin:node/recommended",
    "plugin:json/recommended",
    "plugin:promise/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],

  parser: "@typescript-eslint/parser",

  parserOptions: {
    ecmaVersion: 12,
  },

  rules: {
    "node/no-missing-import": "off",
    "node/no-unpublished-import": "off",
    "prettier/prettier": "warn",
    "import/order": [
      "warn",
      {
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "sort-vars": ["warn", { ignoreCase: true }],
    "node/no-unsupported-features/es-syntax": [
      "error",
      { ignores: ["modules"] },
    ],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
  },

  ignorePatterns: ["dist", "**/*.d.ts"],
};
