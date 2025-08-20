import { fullVersion, dottedVersion } from './../cpan-versions.mjs';

const versionRx = /(?<version>v?[0-9][0-9_]*(?:\.[0-9_]+)*)/;

const perlPrereqRxs = [
  {
    rx:    '^\\s*(?:use|require)\\s+' + versionRx.source + '\\s*;',
    phase: 'configure',
  },
  {
    rx:    '^\\s*([\'"]?)MIN_PERL_VERSION\\1\\s*=>\\s*([\'"]?)' + versionRx.source + '\\b\\2',
    phase: 'runtime',
  },
].map(({ rx, ...rest }) => ({ rx: new RegExp(rx), ...rest }));

export const parseMakefilePL = async (content) => {
  const prereqs = [];

  const prereq = 'perl';
  const relationship = 'requires';

  let in_pod = false;

  for (const line of (await content).split('\n')) {
    if (line.match(/^__(?:END|DATA)__\b/)) {
      break;
    }

    if (in_pod) {
      if (line.match(/^=cut\b/)) {
        in_pod = false;
      }
      continue;
    }
    if (line.match(/^=[a-z]/)) {
      in_pod = true;
      continue;
    }

    for (const { rx, phase } of perlPrereqRxs) {
      const res = line.match(rx);
      if (res !== null) {
        let { version } = res.groups;
        version = fullVersion(dottedVersion(version));

        prereqs.push({
          phase,
          relationship,
          prereq,
          version,
        });
      }
    }
  }

  return prereqs;
};
