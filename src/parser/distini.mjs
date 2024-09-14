import { parse } from './ini-peg.mjs';
import { fullVersion } from './../cpan-versions.mjs';

const prefixes = {
  '=': '',
  '@': 'Dist::Zilla::PluginBundle::',
  '%': 'Dist::Zilla::Stash::',
  '':  'Dist::Zilla::Plugin::',
  '_': 'Dist::Zilla',
};

const prefixRx = /^(?:_$|[=@%]|)/;

const expandConfigPackageName = section =>
  section.replace(prefixRx, prefix => prefixes[prefix]);

export const parseDistINI = async (content) => {
  const prereqs = [];

  const rootSection = {
    section:  '_',
    settings: {},
  };
  const sections = [rootSection];
  let currentSettings = rootSection.settings;

  for (const { section, comment, key, value } of parse(await content)) {
    if (section) {
      currentSettings = {};
      sections.push({ section, settings: currentSettings });
    }
    else if (comment) {
      const res = comment.match(/^\s*authordep\s*(\S+)\s*(?:=\s*([^;]+))?\s*/);
      if (res !== null) {
        const [, module, version] = res;
        prereqs.push({
          prereq:  module,
          version: fullVersion(version || '0'),
        });
      }
    }
    else if (key) {
      currentSettings[key] = value;
    }
  }

  const { license } = rootSection.settings;
  if (license) {
    prereqs.push({
      prereq:  'Software::License::' + license,
      version: '>=0',
    });
  }

  for (const { section, settings } of sections) {
    const plugin = expandConfigPackageName(section.replace(/\s*\/.*$/, ''));
    prereqs.push({
      prereq:  plugin,
      version: fullVersion(settings[':version'] || '0'),
    });

    if (
      plugin === 'Dist::Zilla::PluginBundle::Filter'
      || plugin === 'Dist::Zilla::PluginBundle::ConfigSlicer'
    ) {
      prereqs.push({
        prereq:  expandConfigPackageName(settings['-bundle']),
        version: fullVersion(settings['-version'] || '0'),
      });
    }
  }

  return prereqs.map(req => ({
    ...req,
    phase:        'author',
    relationship: 'requires',
  }));
};
