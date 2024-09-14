import { fullVersion } from './cpan-versions.mjs';

const meta2Prereqs = (meta) => {
  const prereqs = [];
  if (meta.prereqs) {
    for (const [phase, phaseData] of Object.entries(meta.prereqs)) {
      for (const [relationship, relationData] of Object.entries(phaseData)) {
        for (const [prereq, version] of Object.entries(relationData)) {
          prereqs.push({
            phase,
            relationship,
            prereq,
            version: fullVersion(version),
          });
        }
      }
    }
  }
  return prereqs;
};

const meta1fields = {
  build_requires:     ['build', 'requires'],
  configure_requires: ['configure', 'requires'],
  conflicts:          ['runtime', 'conflicts'],
  recommends:         ['runtime', 'recommends'],
  requires:           ['runtime', 'requires'],
};
const meta1Prereqs = (meta) => {
  const prereqs = [];
  for (const [field, [phase, relationship]] of Object.entries(meta1fields)) {
    if (meta[field]) {
      for (const [prereq, version] of Object.entries(meta[field])) {
        prereqs.push({
          phase,
          relationship,
          prereq,
          version: fullVersion(version),
        });
      }
    }
  }
  return prereqs;
};

const metaFeaturePrereqs = (meta) => {
  const prereqs = [];
  if (meta.optional_features) {
    for (const [feature, featureMeta] of Object.entries(
      meta.optional_features,
    )) {
      const featurePrereqs = meta2Prereqs(featureMeta);
      for (const prereq of featurePrereqs) {
        prereq.feature = feature;
      }
      prereqs.push(...featurePrereqs);
    }
  }
  return prereqs;
};

export const metaPrereqs = meta => [
  ...meta1Prereqs(meta),
  ...meta2Prereqs(meta),
  ...metaFeaturePrereqs(meta),
];
