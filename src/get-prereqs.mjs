import * as fs from 'node:fs/promises';
import { parseCPANfile } from './parser-cpanfile.mjs';
import { parseMakefile } from './parser-makefile.mjs';
import { fullVersion, mergeVersions } from './cpan-versions.mjs';
import * as yaml from 'js-yaml';

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
  build_requires: ['build', 'requires'],
  configure_requires: ['configure', 'requires'],
  conflicts: ['runtime', 'conflicts'],
  recommends: ['runtime', 'recommends'],
  requires: ['runtime', 'requires'],
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
      meta.optional_features
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

const metaPrereqs = (meta) => [
  ...meta1Prereqs(meta),
  ...meta2Prereqs(meta),
  ...metaFeaturePrereqs(meta),
];

const parsePrereqsJSON = async (content) => {
  const parsed = JSON.parse(content);
  return metaPrereqs({ prereqs: parsed });
};

const parsePrereqsYAML = async (content) => {
  const parsed = yaml.load(content);
  return metaPrereqs({ prereqs: parsed });
};

const parseMetaJSON = async (content) => {
  const meta = JSON.parse(content);
  return metaPrereqs(meta);
};

const parseMetaYAML = async (content) => {
  const meta = yaml.load(content);
  return metaPrereqs(meta);
};

const filterPrereqs = ({ prereqs, phases, relationships, features }) => {
  return prereqs.filter(
    (prereq) =>
      phases.has(prereq.phase) &&
      relationships.has(prereq.relationship) &&
      (!prereq.feature || features.includes(prereq.feature))
  );
};

const sortByPrereq = (a, b) => {
  if (a.prereq < b.prereq) {
    return -1;
  } else if (a.prereq > b.prereq) {
    return 1;
  }
  return 0;
};

export const getPrereqs = async ({
  phases = ['build', 'test', 'runtime'],
  relationships = ['requires'],
  features = [],
  sources,
}) => {
  for (const source of sources) {
    const content = await fs
      .readFile(source, { encoding: 'utf8' })
      .catch((e) => {
        if (e.code === 'ENOENT') {
          return null;
        } else {
          throw e;
        }
      });
    if (content === null) {
      continue;
    }

    const parser =
      source.match(/prereqs\.json$/) ? parsePrereqsJSON
      : source.match(/prereqs\.yml/) ? parsePrereqsYAML
      : source.match(/\.json$/) ? parseMetaJSON
      : source.match(/\.ya?ml$/) ? parseMetaYAML
      : source.match(/makefile$/i) ? parseMakefile
      : source.match(/cpanfile/i) ? parseCPANfile
      : null;
    if (parser === null) {
      throw new Error(`Don't know how to parse ${source}`);
    }

    const filteredPrereqs = filterPrereqs({
      prereqs: await parser(content),
      phases: new Set(phases),
      relationships: new Set(relationships),
      features: new Set(features),
    }).toSorted(sortByPrereq);

    const prereqs = {};
    for (const { prereq, version } of filteredPrereqs) {
      if (prereqs[prereq]) {
        prereqs[prereq] = mergeVersions([version, prereqs[prereq]]);
      } else {
        prereqs[prereq] = version;
      }
    }

    return prereqs;
  }

  return {};
};
