import { getPrereqs } from './get-prereqs.mjs';
import { cpanmVersion } from './cpan-versions.mjs';
import parseArgs from 'minimist';

export const run = async (argv) => {
  const arrayOpts = [
    'phases',
    'relationships',
    'features',
    'sources',
    'exclude',
  ];

  const {
    _: args,
    perl: showPerl,
    ...options
  } = Object.assign({},
    ...Object.entries(
      parseArgs(argv, {
        boolean: [
          'perl',
          'allSources',
        ],
        string: [
          'phases',
          'relationships',
          'features',
          'sources',
          'exclude',
        ],
        alias: {
          phases:        'phase',
          relationships: ['relationship', 'relate'],
          features:      'feature',
          sources:       'source',
          allSources:    ['all-sources', 'all'],
        },
      }),
    ).map(([k, v]) => {
      if (!arrayOpts.includes(k)) {
        return { [k]: v };
      }
      const asArray = Array.isArray(v) ? v : [v];
      return { [k]: asArray.map(v => v.split(/[\s,]+/)).flat() };
    }),
  );

  if (args.length) {
    throw new Error(`unexpected arguments: ${args.join(', ')}`);
  }

  const { perl, ...prereqs } = await getPrereqs(options);

  if (showPerl) {
    process.stdout.write(perl + '\n');
    return;
  }

  const prereqVersionString = Object.entries(prereqs)
    .map(([module, version]) => `${module}${cpanmVersion(version)}\n`)
    .join('');

  process.stdout.write(prereqVersionString);
};

await (async () => {
  await run(process.argv.slice(2));
})();
