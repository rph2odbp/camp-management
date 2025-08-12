module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json"], // Correctly reference only existing tsconfig.json
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
    "max-len": ["error", { "code": 120 }], // Set a more lenient max line length
    "object-curly-spacing": ["error", "always"],
    "comma-spacing": ["error", { "before": false, "after": true }],
    "semi": ["error", "always"],
    "no-trailing-spaces": "error",
    "spaced-comment": ["error", "always"],
    "camelcase": ["error", { "properties": "never" }], // Allow non-camelCase for destructured properties
    "no-var": "error",
    "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
    "eol-last": ["error", "always"],
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "off", // Temporarily turn off for 'any' types
  },
};
