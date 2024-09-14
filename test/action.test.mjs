import { describe, it } from 'mocha';
import { expect } from 'chai';

import { dirname, join as joinPath } from 'node:path';
import { fileURLToPath } from 'url';

import esmock from 'esmock';

const __dirname = dirname(fileURLToPath(import.meta.url));

const mockAction = async (module) => {
  let outputs;
  let inputs;
  let failed;
  const main = await esmock(module, {
    '@actions/core': {
      getInput:          key => (inputs[key] || '').trim(),
      getMultilineInput: key => (inputs[key] || '').split(/\n/).map(t => t.trim()),
      setOutput:         (key, value) => { outputs[key] = value; },
      setFailed:         (message) => { failed = message; },
    },
  });
  return async (input) => {
    outputs = {};
    inputs = input;
    failed = undefined;
    await main();
    if (failed) {
      throw new Error(failed);
    }
    return {
      outputs,
    };
  };
};

const main = await mockAction('../src/main.mjs');

describe('GitHub action', function () {
  it('works with META.json', async function () {
    const { outputs } = await main({
      sources:       joinPath(__dirname, 'corpus', 'META.json'),
      phases:        'test',
      relationships: 'recommends',
      features:      '',
      exclude:       '',
    });
    expect(outputs).to.be.deep.equal({
      'prereqs':            'CPAN::Meta~2.120900\n',
      'prereqs-no-version': 'CPAN::Meta\n',
      'prereqsJSON':        '{"CPAN::Meta":">=2.120900"}',
    });
  });

  it('works with dist.ini', async function () {
    const { outputs } = await main({
      sources:       joinPath(__dirname, 'corpus', 'dist.ini'),
      phases:        'author',
      relationships: 'requires',
      features:      '',
      exclude:       '^inc::',
    });
    expect(outputs.prereqs).to.be.equal(`
      Dist::Zilla~5.0
      Dist::Zilla::Plugin::GatherFile
      Dist::Zilla::Plugin::Git::GatherDir~5
      Dist::Zilla::Plugin::PodWeaver
      Dist::Zilla::Plugin::Substitute~3
      Dist::Zilla::PluginBundle::Basic~6
      Dist::Zilla::PluginBundle::ConfigSlicer
      Dist::Zilla::PluginBundle::Filter~2
      Dist::Zilla::PluginBundle::Git::VersionManager
      Pod::Weaver::Plugin::StopWords
      Pod::Weaver::Section::Contributors
      Software::License::Perl_5
    `.trimStart().replace(/^ */mg, ''));
  });
});
