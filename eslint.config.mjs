import globals from 'globals';
import js from '@eslint/js';
import mochaPlugin from 'eslint-plugin-mocha';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import peggyPlugin from '@peggyjs/eslint-plugin/lib/flat/recommended.js';

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
  peggyPlugin,
  js.configs.recommended,
  mochaPlugin.configs.flat.recommended,
  {
    ...prettierPlugin,
    ignores: ['**/*.pegjs'],
  },
];
