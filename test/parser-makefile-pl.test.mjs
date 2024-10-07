import { describe, it } from 'mocha';
import { expect } from 'chai';
import fs from 'node:fs/promises';
import { parseMakefilePL } from '../src/parser/makefile-pl.mjs';
import { dirname, join as joinPath } from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Makefile.PL parser', function () {
  it('parses use line', async function () {
    const filename = joinPath(__dirname, 'corpus', 'Makefile.PL-use');
    const content = await fs.readFile(filename, { encoding: 'utf8' });
    const prereqs = await parseMakefilePL(content);
    expect(prereqs).to.be.deep.equal([
    ]);
  });

  it('parses MIN_PERL_VERSION line', async function () {
    const filename = joinPath(__dirname, 'corpus', 'Makefile.PL-MIN_PERL_VERSION');
    const content = await fs.readFile(filename, { encoding: 'utf8' });
    const prereqs = await parseMakefilePL(content);
    expect(prereqs).to.be.deep.equal([
    ]);
  });
});
