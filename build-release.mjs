#!/usr/bin/env node

import esbuild from 'esbuild';
import { esbuildPeggyPlugin } from './src/peggy-compile.mjs';

const config = {
  entryPoints:  ['src/action.mjs'],
  format:       'esm',
  outdir:       'dist',
  outExtension: { '.js': '.mjs' },
  bundle:       true,
  platform:     'node',
  target:       ['node20'],
  dropLabels:   ['NOCOMPILE'],
  minify:       true,
  plugins:      [
    esbuildPeggyPlugin(),
  ],
};

const ctx = await esbuild.context(config);
await ctx.rebuild();
ctx.dispose();
