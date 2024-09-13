import globals from 'globals';
import js from '@eslint/js';

export default [
  {
    ignores: [
      "src/cpanfile-peg.mjs",
    ],
  },
  {
    files: [ "src/**/*.mjs" ],
    languageOptions: {
      sourceType: "module",
    },
  },
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  js.configs.recommended,
];
