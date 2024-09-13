import { fullVersion } from './cpan-versions.mjs';

const fieldMapping = {
  PREREQ_PM: ['runtime', 'requires'],
  BUILD_REQUIRES: ['build', 'requires'],
  TEST_REQUIRES: ['test', 'requires'],
  CONFIGURE_REQUIRES: ['configure', 'requires'],
  MIN_PERL_VERSION: ['runtime', 'requires', 'perl'],
};

const prereqRx = new RegExp(
  `^#\\s+(${Object.keys(fieldMapping).join('|')})\\s+=>\\s+(.*)`
);

export const parseMakefile = async (content) => {
  const allPrereqs = [];

  for (const line of content.split('\n')) {
    if (line.match(/MakeMaker post_initialize section/)) {
      break;
    }
    const res = line.match(prereqRx);
    if (res !== null) {
      const [, field, prereqString] = res;
      const [phase, relationship, module] = fieldMapping[field];

      let prereqRes;
      if (module) {
        const valueRes = prereqString.match(/^\s*q\[(.*?)\]|(undef)/);
        if (valueRes) {
          prereqRes = [[null, module, ...[...valueRes].slice(1)]];
        } else {
          prereqRes = [];
        }
      } else {
        prereqRes = prereqString.matchAll(
          /\s([\w:]+)=>(?:q\[(.*?)\]|(undef)),?/g
        );
      }

      for (const [, prereq, versionString, noVersion] of prereqRes) {
        const version = noVersion ? '>=0' : fullVersion(versionString);
        allPrereqs.push({
          phase,
          relationship,
          prereq,
          version,
        });
      }
    }
  }

  return allPrereqs;
};
