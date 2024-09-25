import { fullVersion } from './../cpan-versions.mjs';
import '../peggy-loader.mjs';
const { parse } = await import('./ini.pegjs');

const prefixes = {
  '=': '',
  '@': 'Dist::Zilla::PluginBundle::',
  '%': 'Dist::Zilla::Stash::',
  '':  'Dist::Zilla::Plugin::',
};

const quoteMeta = k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const prefixRx = new RegExp('^(?:' + Object.keys(prefixes).map(quoteMeta).join('|') + ')');

const expandConfigPackageName = section =>
  section.replace(prefixRx, prefix => prefixes[prefix]);

export const parseDistINI = async (content) => {
  const prereqs = [];

  const rootSection = {
    section:  '_',
    pack:     'Dist::Zilla',
    settings: {},
  };
  let currentSettings = rootSection.settings;
  const sections = [rootSection];

  for (const { section, comment, key, value } of parse(await content)) {
    if (section) {
      const [, plugin, name] = section.match(/^([^\/]*?)\s*(?:\/\s*(.*))?$/);

      const pack = expandConfigPackageName(plugin);

      currentSettings = {};
      sections.push({
        section,
        plugin,
        pack,
        name,
        settings: currentSettings,
      });
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

  for (const { section, pack, settings } of sections) {
    prereqs.push({
      prereq:  pack,
      version: fullVersion(settings[':version'] || '0'),
    });

    if (
      pack === 'Dist::Zilla::PluginBundle::Filter'
      || pack === 'Dist::Zilla::PluginBundle::ConfigSlicer'
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
