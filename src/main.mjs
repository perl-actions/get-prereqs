import * as core from '@actions/core';
import { getPrereqs } from './get-prereqs.mjs';
import { cpanmVersion, dottedVersion } from './cpan-versions.mjs';

const run = async () => {
  const phases = core.getInput('phases').split(/\s+/);
  const relationships = core.getInput('relationships').split(/\s+/);
  const features = core.getInput('features').split(/\s+/);
  const sources = core.getInput('sources').split(/\s+/);

  const { perl, ...prereqs } = await getPrereqs({
    phases,
    relationships,
    features,
    sources,
  });

  if (perl) {
    core.setOutput('perl', dottedVersion(perl));
  }

  const prereqString = Object.keys(prereqs)
    .map(module => `${module}\n`)
    .join('');
  const prereqVersionString = Object.entries(prereqs)
    .map(([module, version]) => `${module}${cpanmVersion(version)}\n`)
    .join('');

  core.setOutput('prereqs', prereqVersionString);
  core.setOutput('prereqs-no-version', prereqString);
  core.setOutput('prereqsJSON', JSON.stringify(prereqs));
};

(async () => {
  try {
    await run();
  }
  catch (error) {
    core.setFailed(error.message);
  }
})();
