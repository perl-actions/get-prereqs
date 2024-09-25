import { describe, it } from 'mocha';
import { expect } from 'chai';
import { dottedVersion } from '../src/cpan-versions.mjs';

describe('version conversion', function () {
  it('works for perl version', async function () {
    expect(dottedVersion('>=5.006')).to.be.equal('v5.6');
  });
});
