import assert from 'node:assert';
import { dottedVersion } from '../src/cpan-versions.mjs';

describe('perl version', function () {
  it('converted correctly', async function () {
    assert.strictEqual(dottedVersion('>=5.006'), 'v5.6');
  });
});
