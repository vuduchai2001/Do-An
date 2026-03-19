import js from '@eslint/js';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';

const ROOT_DIR = dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  globalIgnores(['**/dist/**', '**/node_modules/**']),
  {
    files: ['apps/backend/src/**/*.ts', 'apps/backend/test/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, eslintConfigPrettier],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
      parserOptions: {
        tsconfigRootDir: ROOT_DIR,
        project: resolve(ROOT_DIR, 'apps/backend/tsconfig.eslint.json'),
      },
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['apps/backend/scripts/*.{js,mjs}'],
    extends: [js.configs.recommended, eslintConfigPrettier],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      eslintConfigPrettier,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        tsconfigRootDir: ROOT_DIR,
        project: resolve(ROOT_DIR, 'apps/web/tsconfig.eslint.json'),
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    files: ['packages/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, eslintConfigPrettier],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
      parserOptions: {
        tsconfigRootDir: ROOT_DIR,
      },
    },
  },
]);
