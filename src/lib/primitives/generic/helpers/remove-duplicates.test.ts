import assert from 'node:assert';
import { describe, it } from 'node:test';

import { RemoveDuplicates } from './remove-duplicates';

await describe('remove duplicates', async () => {
    await it('should remove primitive duplicates', () => {
        assert.deepEqual(RemoveDuplicates(['hello', 'world', 'hello', 'world']), [
            'hello',
            'world',
        ]);

        assert.deepEqual(RemoveDuplicates([1, 2, 2, 4, 5, 6, 6]), [1, 2, 4, 5, 6]);
    });

    await it('should remove the object duplates based on the extracted value', () => {
        const result = RemoveDuplicates(
            [{ test: 'value1' }, { test: 'value1' }, { test: 'value2' }, { test: 'value3' }],
            item => item.test,
        );

        assert.deepEqual(result, [{ test: 'value1' }, { test: 'value2' }, { test: 'value3' }]);
    });
});
