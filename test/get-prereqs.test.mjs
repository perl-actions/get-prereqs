import assert from 'node:assert';
import { getPrereqs } from '../src/get-prereqs.mjs';
import { dirname, join as joinPath } from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('META.json', function () {
  it('has correct prereqs', async function() {
    const filename = joinPath(__dirname, 'corpus', 'META.json');
    const prereqs = await getPrereqs({
      sources:        [filename],
      phases:         ['test'],
      relationships:  ['recommends'],
    });
    assert.deepStrictEqual(prereqs, {
      'CPAN::Meta': '>=2.120900',
    });
  });
});

describe('Makefile', function () {
  it('has correct prereqs', async function() {
    const filename = joinPath(__dirname, 'corpus', 'Makefile');
    const prereqs = await getPrereqs({
      sources:        [filename],
    });
    assert.deepStrictEqual(prereqs, {
      "Carp": ">=0",
      "Class::Method::Modifiers": ">=1.10",
      "Exporter": ">=0",
      "Role::Tiny": ">=2.003000",
      "Scalar::Util": ">=1.00",
      "Sub::Defer": ">=2.006006",
      "Sub::Quote": ">=2.006006",
      "Test::More": ">=0.94",
      "perl": ">=5.006",
    });
  });
});

describe('Makefile', function () {
  it('has correct prereqs', async function() {
    const filename = joinPath(__dirname, 'corpus', 'Makefile');
    const prereqs = await getPrereqs({
      sources:        [filename],
    });
    assert.deepStrictEqual(prereqs, {
      "Carp": ">=0",
      "Class::Method::Modifiers": ">=1.10",
      "Exporter": ">=0",
      "Role::Tiny": ">=2.003000",
      "Scalar::Util": ">=1.00",
      "Sub::Defer": ">=2.006006",
      "Sub::Quote": ">=2.006006",
      "Test::More": ">=0.94",
      "perl": ">=5.006",
    });
  });
});

describe('cpanfile', function () {
  it('has correct prereqs', async function() {
    const filename = joinPath(__dirname, 'corpus', 'cpanfile');
    const prereqs = await getPrereqs({
      sources:        [filename],
    });
    assert.deepStrictEqual(prereqs, {
      "Moo": ">=0",
      "Moose": ">=2",
      "Test::More": ">=0.88",
    });
  });
});
