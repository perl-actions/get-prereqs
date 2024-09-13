import assert from 'node:assert';
import { getPrereqs } from '../src/get-prereqs.mjs';
import { dirname, join as joinPath } from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('getPrereqs', function () {
  it('parses META.json correctly', async function () {
    const filename = joinPath(__dirname, 'corpus', 'META.json');
    const prereqs = await getPrereqs({
      sources: [filename],
      phases: ['test'],
      relationships: ['recommends'],
    });
    assert.deepStrictEqual(prereqs, {
      'CPAN::Meta': '>=2.120900',
    });
  });

  it('parses Makefile correctly', async function () {
    const filename = joinPath(__dirname, 'corpus', 'Makefile');
    const prereqs = await getPrereqs({
      sources: [filename],
    });
    assert.deepStrictEqual(prereqs, {
      Carp: '>=0',
      'Class::Method::Modifiers': '>=1.10',
      Exporter: '>=0',
      'Role::Tiny': '>=2.003000',
      'Scalar::Util': '>=1.00',
      'Sub::Defer': '>=2.006006',
      'Sub::Quote': '>=2.006006',
      'Test::More': '>=0.94',
      perl: '>=5.006',
    });
  });

  it('parses cpanfile correctly', async function () {
    const filename = joinPath(__dirname, 'corpus', 'cpanfile');
    const prereqs = await getPrereqs({
      sources: [filename],
    });
    assert.deepStrictEqual(prereqs, {
      Moo: '>=0',
      Moose: '>=2',
      'Test::More': '>=0.88',
    });
  });
});
