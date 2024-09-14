import { describe, it } from 'mocha';
import { expect } from 'chai';
import { dottedVersion } from '../src/cpan-versions.mjs';

describe('perl version', function () {
  it('converted correctly', async function () {
    expect(dottedVersion('>=5.006')).to.be.equal('v5.6');
  });
});
