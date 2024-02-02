import assert from 'node:assert';
import { describe, it } from 'node:test';
import { CartesianOf, CartesianOfRecord, CartesianProduct } from './cartesian-product';

await describe('cartesian product', async () => {
    await it('the binary cartesian product should work', () => {
        assert.deepEqual(CartesianProduct([1, 'true', 90], ['test', false]), [
            [1, 'test'],
            [1, false],
            ['true', 'test'],
            ['true', false],
            [90, 'test'],
            [90, false],
        ]);

        assert.deepEqual(CartesianProduct([[1, 'true'], 90], ['test', [false]]), [
            [1, 'true', 'test'],
            [1, 'true', [false]],
            [90, 'test'],
            [90, [false]],
        ]);
        assert.deepEqual(CartesianProduct([], ['test', false]), []);
        assert.deepEqual(CartesianProduct(['test', false], []), []);
    });

    await it('the cartesian product of multiple arrays should work', () => {
        assert.deepEqual(CartesianOf([1, 'true', 90], ['test', false]), [
            [1, 'test'],
            [1, false],
            ['true', 'test'],
            ['true', false],
            [90, 'test'],
            [90, false],
        ]);

        assert.deepEqual(CartesianOf([1, 'true', 90]), [[1], ['true'], [90]]);

        assert.deepEqual(CartesianOf([1, 'true', 90], ['test', false], [10, 'go']), [
            [1, 'test', 10],
            [1, 'test', 'go'],
            [1, false, 10],
            [1, false, 'go'],
            ['true', 'test', 10],
            ['true', 'test', 'go'],
            ['true', false, 10],
            ['true', false, 'go'],
            [90, 'test', 10],
            [90, 'test', 'go'],
            [90, false, 10],
            [90, false, 'go'],
        ]);
    });

    await it('the cartesian product of a Record<string, array> should work', () => {
        assert.deepEqual(CartesianOfRecord({ test: [1, 'B', 'C'] }), [
            { test: 1 },
            { test: 'B' },
            { test: 'C' },
        ]);

        assert.deepEqual(CartesianOfRecord({ test: 1, test2: ['A', 'B', 'C'], test3: [1, 2, 3] }), [
            {
                test: 1,
                test2: 'A',
                test3: 1,
            },
            {
                test: 1,
                test2: 'A',
                test3: 2,
            },
            {
                test: 1,
                test2: 'A',
                test3: 3,
            },
            {
                test: 1,
                test2: 'B',
                test3: 1,
            },
            {
                test: 1,
                test2: 'B',
                test3: 2,
            },
            {
                test: 1,
                test2: 'B',
                test3: 3,
            },
            {
                test: 1,
                test2: 'C',
                test3: 1,
            },
            {
                test: 1,
                test2: 'C',
                test3: 2,
            },
            {
                test: 1,
                test2: 'C',
                test3: 3,
            },
        ]);
    });
});
