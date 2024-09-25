import fs from 'node:fs/promises';
import { parseCPANfile } from './parser/cpanfile.mjs';
import { parseMakefile } from './parser/makefile.mjs';
import { parseDistINI } from './parser/distini.mjs';
import {
  parsePrereqsJSON,
  parsePrereqsYAML,
  parseMetaJSON,
  parseMetaYAML,
} from './parser/meta.mjs';
import { mergeVersions } from './cpan-versions.mjs';

const filterPrereqs = ({
  prereqs,
  phases,
  relationships,
  features,
  excludes,
}) => {
  return prereqs.filter(
    prereq =>
      phases.has(prereq.phase)
      && relationships.has(prereq.relationship)
      && (!prereq.feature || features.includes(prereq.feature))
      && excludes.filter(ex => ex.exec(prereq.prereq)).length === 0,
  );
};

const parsers = [
  [/prereqs\.json$/, parsePrereqsJSON],
  [/prereqs\.yml/, parsePrereqsYAML],
  [/\.json$/, parseMetaJSON],
  [/\.ya?ml$/, parseMetaYAML],
  [/makefile$/i, parseMakefile],
  [/cpanfile/i, parseCPANfile],
  [/dist\.ini/, parseDistINI],
];

const parserFor = (file) => {
  for (const [pattern, parser] of parsers) {
    if (file.match(pattern)) {
      return parser;
    }
  }
  throw new Error(`Don't know how to parse ${file}`);
};

const sortByPrereq = (a, b) => {
  if (a.prereq < b.prereq) {
    return -1;
  }
  else if (a.prereq > b.prereq) {
    return 1;
  }
  return 0;
};

export const getPrereqs = async ({
  phases = ['build', 'test', 'runtime'],
  relationships = ['requires'],
  features = [],
  sources,
  excludes = [],
}) => {
  for (const source of sources) {
    const parser = parserFor(source);

    let fh;
    try {
      fh = await fs.open(source);
    }
    catch (e) {
      if (e.code === 'ENOENT') {
        continue;
      }
      else {
        throw e;
      }
    }

    const content = fh.readFile({ encoding: 'utf8' });

    const allPrereqs = await parser(content);
    await fh.close();

    const filteredPrereqs = filterPrereqs({
      prereqs:       allPrereqs,
      phases:        new Set(phases),
      relationships: new Set(relationships),
      features:      new Set(features),
      excludes,
    }).toSorted(sortByPrereq);

    const prereqs = {};
    for (const { prereq, version } of filteredPrereqs) {
      if (prereqs[prereq]) {
        prereqs[prereq] = mergeVersions([version, prereqs[prereq]]);
      }
      else {
        prereqs[prereq] = version;
      }
    }

    return prereqs;
  }

  return {};
};
