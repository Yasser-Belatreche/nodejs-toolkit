import assert from 'node:assert';
import { describe, it, mock } from 'node:test';

import { Retry, retry } from './retry';

await describe('retry', async () => {
    await it('should not retry if the method does not faild', async () => {
        const method = async (): Promise<number> => {
            return 10;
        };

        assert.equal(await retry(method), await method());
    });

    await it('if the method fail, should retry 3 times by default before failing', async () => {
        const method = mock.fn(async () => {
            throw new Error('failed');
        });

        try {
            await retry(method);
        } catch (e) {
            assert.ok(e instanceof Error);
            assert.equal(e.message, 'failed');
        }

        assert.equal(method.mock.calls.length, 3);
    });

    await it('should retry the specified number of times before failing', async () => {
        const method = mock.fn(async () => {
            throw new Error('failed');
        });

        try {
            await retry(method, { retries: 5 });
        } catch (e) {
            assert.ok(e instanceof Error);
            assert.equal(e.message, 'failed');
        }

        assert.equal(method.mock.calls.length, 5);
    });

    await it('should wait the 1000ms delay between retries by default', async () => {
        const method = mock.fn(async () => {
            throw new Error('failed');
        });

        const start = Date.now();

        try {
            await retry(method);
        } catch (e) {
            assert.ok(e instanceof Error);
            assert.equal(e.message, 'failed');
        }

        const end = Date.now();

        // there are 2 retries not 3 because the first call is not a retry
        assert.ok(end - start >= 2 * 1000);
    });

    await it('should wait the specified delay between retries', async () => {
        const method = mock.fn(async () => {
            throw new Error('failed');
        });

        const start = Date.now();

        try {
            await retry(method, { retries: 4, delay: 100 });
        } catch (e) {
            assert.ok(e instanceof Error);
            assert.equal(e.message, 'failed');
        }

        const end = Date.now();

        assert.ok(end - start >= 3 * 100);
    });

    await it('Retry method decorator should work the same way as the retry function', async () => {
        class Test {
            @Retry()
            async method(): Promise<void> {
                throw new Error('failed');
            }
        }

        let start: number, end: number;

        const test = new Test();

        start = Date.now();

        try {
            await test.method();
        } catch (e) {
            assert.ok(e instanceof Error);
            assert.equal(e.message, 'failed');
        }

        end = Date.now();

        assert.ok(end - start >= 2 * 1000);

        class Test2 {
            @Retry({ retries: 5, delay: 100 })
            async method(): Promise<void> {
                throw new Error('failed');
            }
        }

        const test2 = new Test2();

        start = Date.now();

        try {
            await test2.method();
        } catch (e) {
            assert.ok(e instanceof Error);
            assert.equal(e.message, 'failed');
        }

        end = Date.now();

        assert.ok(end - start >= 4 * 100);

        class Test3 {
            @Retry({ retries: 5, delay: 100 })
            async method(): Promise<number> {
                return 3;
            }
        }

        const test3 = new Test3();

        assert.equal(await test3.method(), 3);
    });
});
