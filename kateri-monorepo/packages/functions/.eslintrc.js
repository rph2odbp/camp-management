module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json']
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'prettier'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    // Example custom rules:
    'prettier/prettier': 'error',
    'react/prop-types': 'off', // If using TypeScript for props
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-console': 'warn'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.js'
  ]
};
