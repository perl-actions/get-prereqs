import { parse } from './cpanfile-peg.mjs';

export const parseCPANfile = async content => parse(content);
