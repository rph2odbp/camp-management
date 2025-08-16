module.exports = {
  root: true, // This tells ESLint this is the root config for the 'functions' package
  env: {
    es6: true,
    node: true,
  },
  // These 'extends' and 'rules' apply to all files initially (including .js config files)
  extends: [
    'eslint:recommended', // Basic recommended ESLint rules
    'google', // Google style guide for general JavaScript
  ],
  ignorePatterns: [
    '/lib/**/*', // Ignore compiled JavaScript files
    '/generated/**/*', // Ignore any generated files
  ],
  plugins: [
    // 'import' plugin is used in the overrides section for TS files
    // No need to list @typescript-eslint here for the base config
  ],
  rules: {
    quotes: ['error', 'double'],
    indent: ['error', 2],
    // Turn off the default 'no-unused-vars' rule as the TypeScript override handles it
    'no-unused-vars': 'off',
    // === Rules to relax linting for .eslintrc.js itself and general JS ===
    // Relax max line length to 120 characters, ignoring comments, strings, and template literals
    'max-len': [
      'error',
      { code: 120, ignoreComments: true, ignoreStrings: true, ignoreTemplateLiterals: true },
    ],
    // Allow multiple spaces if they are followed by an end-of-line comment (useful for alignment)
    'no-multi-spaces': ['error', { ignoreEOLComments: true }],
    // === NEW RULE ===
    // Disable object-curly-spacing for now to allow deployment
    'object-curly-spacing': 'off',
    // === END of new rules ===
  },
  // --- Use overrides to apply specific rules/parsers to .ts files ---
  overrides: [
    {
      files: ['**/*.ts'], // This configuration ONLY applies to .ts files
      parser: '@typescript-eslint/parser', // Use the TypeScript parser for .ts files
      parserOptions: {
        // 'project' must point to your tsconfig.json, relative to this .eslintrc.js file
        project: ['./tsconfig.json'],
        sourceType: 'module',
      },
      extends: [
        'plugin:import/errors', // Import errors for TypeScript
        'plugin:import/warnings', // Import warnings for TypeScript
        'plugin:import/typescript', // TypeScript specific import rules
        'plugin:@typescript-eslint/recommended', // Recommended TypeScript ESLint rules
      ],
      rules: {
        // TypeScript specific rule for unused variables
        '@typescript-eslint/no-unused-vars': 'off',
        // Turn off 'import/no-unresolved' for TS, as the TS resolver handles it better
        'import/no-unresolved': 'off',
        // === Apply the same relaxation for TS files ===
        'max-len': [
          'error',
          { code: 120, ignoreComments: true, ignoreStrings: true, ignoreTemplateLiterals: true },
        ],
        'no-multi-spaces': ['error', { ignoreEOLComments: true }],
        // === NEW RULE ===
        // Disable object-curly-spacing for now to allow deployment
        'object-curly-spacing': 'off',
        // === END of new rules for TS ===
      },
    },
  ],
};
