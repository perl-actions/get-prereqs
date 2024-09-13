const versionRuleRx = /^([<>]=?|[=!]=)\s*(.*)/;

export const fullVersion = (version) => {
  const realVersion = version ? version.toString() : '0';
  const versions = realVersion.split(/\s*,\s*/);
  return versions.map(v => {
    const res = v.match(versionRuleRx);
    if (res !== null) {
      return `${res[1]}${res[2]}`;
    }
    else {
      return `>=${v}`;
    }
  }).join(',');
};

export const simpleVersion = (version) => {
  const versions = version.split(/\s*,\s*/);
  if (versions.length == 1) {
    return version.replace(/^>=\s*/, '');
  }
  else {
    return version;
  }
};

export const mergeVersions = (versionList) => {
  const versions = versionList.map(v => v.split(/\s*,\s*/)).flat();
  return versions.filter((value, index, array) => array.indexOf(value) === index).join(',');
};

export const cpanmVersion = (version) => {
  const versions = version.split(/\s*,\s*/);
  if (versions.length == 1) {
    if (version == '>=0') {
      return '';
    }
    else {
      const res = version.match(versionRuleRx);
      if (res !== null) {
        const [, comparison, plainVersion] = res;
        if (comparison == '==') {
          return `@${plainVersion}`;
        }
        else if (comparison == '>=') {
          return `~${plainVersion}`;
        }
      }
    }
  }
  return `~${version}`;
};

export const dottedVersion = (versionString) => {
  const versions = [];
  for (const versionRule of versionString.split(/\s*,\s*/)) {
    const res = versionRule.match(versionRuleRx);
    let [, comparison, version] = res ? res : [null, '>=', versionRule];
    const decimalRes = version.match(/^([0-9]+)(?:\.([0-9]+))?$/);
    if (decimalRes !== null) {
      const [ , whole, dec ] = decimalRes;
      const parts = [ whole ];
      if (dec) {
        parts.push(...dec.match(/.{1,3}/g).map(part => parseInt(part.padEnd(3, '0'), 10)));
      }
      version = 'v' + parts.join('.');
    }
    else if (!version.match(/^v?[0-9]+(\.[0-9]+)*$/)) {
      throw new Error(`Can't parse "${version}" as version!`);
    }

    versions.push(comparison == '>=' ? version : comparison + version);
  }
  return versions.join(',');
};
