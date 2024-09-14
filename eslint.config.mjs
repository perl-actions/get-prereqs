import globals from 'globals';
import mochaPlugin from 'eslint-plugin-mocha';
import peggyPlugin from '@peggyjs/eslint-plugin/lib/flat/recommended.js';
import stylistic from '@stylistic/eslint-plugin';

export default [
  {
    ignores: ['src/*-peg.mjs', 'dist/'],
  },
  {
    files:           ['**/*.mjs'],
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
  mochaPlugin.configs.flat.recommended,
  stylistic.configs.customize({
    semi: true,
  }),
  {
    rules: {
      '@stylistic/multiline-ternary': 'off',
      '@stylistic/key-spacing':       [
        'error',
        {
          align: 'value',
        },
      ],
    },
  },
];
