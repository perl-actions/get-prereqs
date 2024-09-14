import { describe, it } from 'mocha';
import { expect } from 'chai';
import { getPrereqs } from '../src/get-prereqs.mjs';
import { dirname, join as joinPath } from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('getPrereqs', function () {
  it('parses META.json correctly', async function () {
    const filename = joinPath(__dirname, 'corpus', 'META.json');
    const prereqs = await getPrereqs({
      sources:       [filename],
      phases:        ['test'],
      relationships: ['recommends'],
    });
    expect(prereqs).to.be.deep.equal({
      'CPAN::Meta': '>=2.120900',
    });
  });

  it('parses Makefile correctly', async function () {
    const filename = joinPath(__dirname, 'corpus', 'Makefile');
    const prereqs = await getPrereqs({
      sources: [filename],
    });
    expect(prereqs).to.be.deep.equal({
      'Carp':                     '>=0',
      'Class::Method::Modifiers': '>=1.10',
      'Exporter':                 '>=0',
      'Role::Tiny':               '>=2.003000',
      'Scalar::Util':             '>=1.00',
      'Sub::Defer':               '>=2.006006',
      'Sub::Quote':               '>=2.006006',
      'Test::More':               '>=0.94',
      'perl':                     '>=5.006',
    });
  });

  it('parses cpanfile correctly', async function () {
    const filename = joinPath(__dirname, 'corpus', 'cpanfile');
    const prereqs = await getPrereqs({
      sources: [filename],
    });
    expect(prereqs).to.be.deep.equal({
      'Moo':        '>=0',
      'Moose':      '>=2',
      'Test::More': '>=0.88',
    });
  });

  it('parses dist.ini correctly', async function () {
    const filename = joinPath(__dirname, 'corpus', 'dist.ini');
    const prereqs = await getPrereqs({
      sources: [filename],
      phases:  ['author'],
    });
    expect(prereqs).to.be.deep.equal({
      'Dist::Zilla':                                    '>=5.0',
      'Dist::Zilla::Plugin::GatherFile':                '>=0',
      'Dist::Zilla::Plugin::Git::GatherDir':            '>=5',
      'Dist::Zilla::Plugin::PodWeaver':                 '>=0',
      'Dist::Zilla::PluginBundle::Basic':               '>=0,>=6',
      'Dist::Zilla::PluginBundle::ConfigSlicer':        '>=0',
      'Dist::Zilla::PluginBundle::Filter':              '>=2',
      'Dist::Zilla::PluginBundle::Git::VersionManager': '>=0',
      'Pod::Weaver::Plugin::StopWords':                 '>=0',
      'Pod::Weaver::Section::Contributors':             '>=0',
      'Software::License::Perl_5':                      '>=0',
      'inc::another':                                   '>=0',
      'inc::bootstrap':                                 '>=0',
    });
  });

  it('excludes applies correctly', async function () {
    const filename = joinPath(__dirname, 'corpus', 'dist.ini');
    const prereqs = await getPrereqs({
      sources:  [filename],
      phases:   ['author'],
      excludes: [/^inc::/],
    });
    expect(prereqs).to.be.deep.equal({
      'Dist::Zilla':                                    '>=5.0',
      'Dist::Zilla::Plugin::GatherFile':                '>=0',
      'Dist::Zilla::Plugin::Git::GatherDir':            '>=5',
      'Dist::Zilla::Plugin::PodWeaver':                 '>=0',
      'Dist::Zilla::PluginBundle::Basic':               '>=0,>=6',
      'Dist::Zilla::PluginBundle::ConfigSlicer':        '>=0',
      'Dist::Zilla::PluginBundle::Filter':              '>=2',
      'Dist::Zilla::PluginBundle::Git::VersionManager': '>=0',
      'Pod::Weaver::Plugin::StopWords':                 '>=0',
      'Pod::Weaver::Section::Contributors':             '>=0',
      'Software::License::Perl_5':                      '>=0',
    });
  });
});
