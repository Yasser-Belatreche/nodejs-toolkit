import assert from 'node:assert';
import { describe, it } from 'node:test';

import { GenerateUnique } from './generate-unique';

await describe('generate unique', async () => {
    await it('should generate unique string of length of 16 by default', async () => {
        const unique1 = await GenerateUnique();
        const unique2 = await GenerateUnique();
        const unique3 = await GenerateUnique();
        const unique4 = await GenerateUnique();

        assert.equal(unique1.length, 16);

        assert.equal(unique1 !== unique2, true);
        assert.equal(unique2 !== unique3, true);
        assert.equal(unique3 !== unique4, true);
    });
});
