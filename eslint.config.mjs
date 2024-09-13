import globals from 'globals';
import js from '@eslint/js';
import mochaPlugin from 'eslint-plugin-mocha';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  {
    ignores: ['src/*-peg.mjs', 'dist/'],
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
    },
  },
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  js.configs.recommended,
  mochaPlugin.configs.flat.recommended,
  eslintPluginPrettierRecommended,
];
