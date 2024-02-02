/* eslint-disable @typescript-eslint/ban-ts-comment */
import assert from 'node:assert';
import { describe, it } from 'node:test';

import { DeepEqual } from './deep-equal';

await describe('deep equal', async () => {
    await it('should work with a primtives, or value objects', () => {
        assert.equal(DeepEqual(1, 1), true);

        assert.equal(DeepEqual(new Date('10-10-2020'), new Date('10-10-2020')), true);
    });

    await it('should work with a record of primtives or value objects', () => {
        assert.equal(DeepEqual({ item: '1' }, { item: '1' }), true);

        assert.equal(
            DeepEqual({ item: new Date('10-10-2020') }, { item: new Date('10-10-2020') }),
            true,
        );
    });

    await it('should work with a record of that have a nested record', () => {
        assert.equal(DeepEqual({ item: { item: '1' } }, { item: { item: '1' } }), true);

        assert.equal(
            DeepEqual(
                { item: { item: new Date('10-10-2020') } },
                { item: { item: new Date('10-10-2020') } },
            ),
            true,
        );
    });
});
