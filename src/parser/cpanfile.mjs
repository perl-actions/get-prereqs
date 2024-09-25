import '../peggy-loader.mjs';
const { parse } = await import('./cpanfile.pegjs');

export const parseCPANfile = async content => parse(await content);
