import core from '@actions/core';
import { getPrereqs } from './get-prereqs.mjs';
import { cpanmVersion, dottedVersion } from './cpan-versions.mjs';

export const run = async () => {
  const phasesInput = core.getInput('phases');
  const relationshipsInput = core.getInput('relationships');
  const featuresInput = core.getInput('features');
  const sourcesInput = core.getInput('sources');
  const excludeInput = core.getMultilineInput('exclude');

  const phases = new Set(phasesInput.split(/\s+/));
  const relationships = new Set(relationshipsInput.split(/\s+/));
  const features = new Set(featuresInput.split(/\s+/));
  const sources = sourcesInput.split(/\s+/);
  const excludes = excludeInput.filter(p => p.length).map(p => new RegExp(p));

  const { perl, ...prereqs } = await getPrereqs({
    phases,
    relationships,
    features,
    sources,
    excludes,
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

export default async () => {
  try {
    await run();
  }
  catch (error) {
    core.setFailed(error.message);
  }
};
