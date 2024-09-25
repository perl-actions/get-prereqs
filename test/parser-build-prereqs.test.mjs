import { describe, it } from 'mocha';
import { expect } from 'chai';
import fs from 'node:fs/promises';
import { parseBuildPrereqs } from '../src/parser/build-prereqs.mjs';
import { dirname, join as joinPath } from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Module::Build prereqs parser', function () {
  it('parses _build/prereqs correctly', async function () {
    const filename = joinPath(__dirname, 'corpus', '_build', 'prereqs');
    const content = await fs.readFile(filename, { encoding: 'utf8' });
    const prereqs = await parseBuildPrereqs(content);
    expect(prereqs).to.be.deep.equal([
      {
        phase:        'runtime',
        prereq:       'perl',
        relationship: 'requires',
        version:      '>=5.006',
      },
      {
        phase:        'build',
        prereq:       'Module::Build',
        relationship: 'requires',
        version:      '>=0',
      },
      {
        phase:        'build',
        prereq:       'Test::More',
        relationship: 'requires',
        version:      '>=0.41',
      },
      {
        phase:        'build',
        prereq:       'perl',
        relationship: 'requires',
        version:      '>=5.006',
      },
      {
        phase:        'build',
        prereq:       'strict',
        relationship: 'requires',
        version:      '>=0',
      },
      {
        phase:        'build',
        prereq:       'warnings',
        relationship: 'requires',
        version:      '>=0',
      },
    ]);
  });
});
