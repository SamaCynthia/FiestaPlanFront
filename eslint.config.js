const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  // 1. IMPORTANTE: Ignorar carpetas de compilación y dependencias
  {
    ignores: ['.angular/**', 'dist/**', 'node_modules/**', '.husky/**'],
  },
  js.configs.recommended,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }], // Evita los molestos errores de saltos de línea (CRLF/LF) de Windows
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
  prettier,
];
