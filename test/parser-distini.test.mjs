import { describe, it } from 'mocha';
import { expect } from 'chai';
import fs from 'node:fs/promises';
import { parseDistINI } from '../src/parser/distini.mjs';
import { dirname, join as joinPath } from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('dist.ini', function () {
  it('parsed correctly', async function () {
    const filename = joinPath(__dirname, 'corpus', 'dist.ini');
    const content = await fs.readFile(filename, { encoding: 'utf8' });
    const prereqs = await parseDistINI(content);
    expect(prereqs).to.be.deep.equal([
      {
        phase:        'author',
        prereq:       'Pod::Weaver::Section::Contributors',
        relationship: 'requires',
        version:      '>=0',
      },
      {
        phase:        'author',
        prereq:       'Pod::Weaver::Plugin::StopWords',
        relationship: 'requires',
        version:      '>=0',
      },
      {
        phase:        'author',
        prereq:       'Software::License::Perl_5',
        relationship: 'requires',
        version:      '>=0',
      },
      {
        phase:        'author',
        prereq:       'Dist::Zilla',
        relationship: 'requires',
        version:      '>=5.0',
      },
      {
        phase:        'author',
        prereq:       'inc::bootstrap',
        relationship: 'requires',
        version:      '>=0',
      },
      {
        phase:        'author',
        prereq:       'Dist::Zilla::Plugin::Git::GatherDir',
        relationship: 'requires',
        version:      '>=5',
      },
      {
        phase:        'author',
        prereq:       'inc::another',
        relationship: 'requires',
        version:      '>=0',
      },
      {
        phase:        'author',
        prereq:       'Dist::Zilla::Plugin::GatherFile',
        relationship: 'requires',
        version:      '>=0',
      },
      {
        phase:        'author',
        prereq:       'Dist::Zilla::Plugin::PodWeaver',
        relationship: 'requires',
        version:      '>=0',
      },
      {
        phase:        'author',
        prereq:       'Dist::Zilla::PluginBundle::Git::VersionManager',
        relationship: 'requires',
        version:      '>=0',
      },
      {
        phase:        'author',
        prereq:       'Dist::Zilla::PluginBundle::Filter',
        relationship: 'requires',
        version:      '>=2',
      },
      {
        phase:        'author',
        prereq:       'Dist::Zilla::PluginBundle::Basic',
        relationship: 'requires',
        version:      '>=6',
      },
      {
        phase:        'author',
        prereq:       'Dist::Zilla::PluginBundle::ConfigSlicer',
        relationship: 'requires',
        version:      '>=0',
      },
      {
        phase:        'author',
        prereq:       'Dist::Zilla::PluginBundle::Basic',
        relationship: 'requires',
        version:      '>=0',
      },
    ]);
  });
});
