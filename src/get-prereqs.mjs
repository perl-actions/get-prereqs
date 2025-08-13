import fs from 'node:fs/promises';
import { parseCPANfile } from './parser/cpanfile.mjs';
import { parseMakefile } from './parser/makefile.mjs';
import { parseMakefilePL } from './parser/makefile-pl.mjs';
import { parseBuildPrereqs } from './parser/build-prereqs.mjs';
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
  [/prereqs\.yml$/, parsePrereqsYAML],
  [/\.json$/, parseMetaJSON],
  [/\.ya?ml$/, parseMetaYAML],
  [/_build[/\\]prereqs$/, parseBuildPrereqs],
  [/makefile$/i, parseMakefile],
  [/cpanfile/i, parseCPANfile],
  [/dist\.ini$/, parseDistINI],
  [/Makefile.PL$/i, parseMakefilePL],
];

const coreModules = [
  'B',
  'B::Deparse',
  'Config',
  'DynaLoader',
  'English',
  'POSIX',
  'Symbol',
  'UNIVERSAL',
  'blib',
  'bytes',
  'charnames',
  'deprecate',
  'feature',
  'integer',
  'lib',
  'open',
  'overload',
  'overloading',
  're',
  'sort',
  'strict',
  'utf8',
  'vars',
  'warnings',
];

const coreMatch = new RegExp(`^(?:${coreModules.join('|')})$`);

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
  sources = [
    'MYMETA.json',
    'MYMETA.yml',
    'META.json',
    'META.yml',
    '_build/prereqs',
    'Makefile',
    'cpanfile',
  ],
  excludes = [],
  allSources = false,
  omitCore = true,
}) => {
  const prereqs = {};

  if (omitCore) {
    excludes = [...excludes, coreMatch];
  }

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

    for (const { prereq, version } of filteredPrereqs) {
      if (prereqs[prereq]) {
        prereqs[prereq] = mergeVersions([version, prereqs[prereq]]);
      }
      else {
        prereqs[prereq] = version;
      }
    }

    if (!allSources) {
      break;
    }
  }

  return prereqs;
};
