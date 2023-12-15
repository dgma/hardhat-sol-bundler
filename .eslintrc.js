module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    "jest/globals": true,
  },
  globals: {
    hre: "readonly",
  },
  plugins: ["jest"],
  extends: ["standard", "prettier"],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {},
};
