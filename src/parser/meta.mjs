import yaml from 'js-yaml';
import { metaPrereqs } from './../cpan-meta.mjs';

export const parsePrereqsJSON = async (content) => {
  const prereqs = JSON.parse(await content);
  return metaPrereqs({ prereqs });
};

export const parsePrereqsYAML = async (content) => {
  const prereqs = yaml.load(await content);
  return metaPrereqs({ prereqs });
};

export const parseMetaJSON = async (content) => {
  const meta = JSON.parse(await content);
  return metaPrereqs(meta);
};

export const parseMetaYAML = async (content) => {
  const meta = yaml.load(await content);
  return metaPrereqs(meta);
};
