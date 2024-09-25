import { fullVersion } from './../cpan-versions.mjs';
import '../peggy-loader.mjs';
const { parse } = await import('./dumper.pegjs');

const buildPrereqsFields = {
  requires:           ['runtime', 'requires'],
  configure_requires: ['configure', 'requires'],
  build_requires:     ['build', 'requires'],
  test_requires:      ['test', 'requires'],
  test_recommends:    ['test', 'recommends'],
  recommends:         ['runtime', 'recommends'],
  conflicts:          ['runtime', 'conflicts'],
};

export const parseBuildPrereqs = async (content) => {
  const buildPrereqs = parse(await content);

  const prereqs = [];
  for (const [field, [phase, relationship]] of Object.entries(buildPrereqsFields)) {
    if (buildPrereqs[field]) {
      for (const [prereq, version] of Object.entries(buildPrereqs[field])) {
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
