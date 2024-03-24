import assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';

import { wait } from '@lib/primitives/generic/helpers/wait';

import { Cache } from '../main/cache';

import { InMemoryCache } from '../main/in-memory-cache';

await describe('cache test', async () => {
    const providers: Cache[] = [InMemoryCache.Instance()];

    for (const cache of providers) {
        await describe(cache.constructor.name, async () => {
            await testCasesOn(cache);
        });
    }
});

async function testCasesOn(cache: Cache): Promise<void> {
    beforeEach(async () => {
        await cache.clear();
    });

    await it('should save stuff and be able to retreive them', async t => {
        await cache.set('test', 'test');

        assert.strictEqual(await cache.get('test'), 'test');
    });

    await it('should save stuff and be able to retreive them', async () => {
        await cache.set('test', 'test');

        assert.strictEqual(await cache.get('test'), 'test', 'test');
    });

    await it('should be able to clear the cache', async () => {
        await cache.set('test', 'test');
        await cache.clear();

        assert.strictEqual(await cache.get('test'), null);
    });

    await it('should be able to invalidate a key', async () => {
        await cache.set('test', 'test');

        assert.strictEqual(await cache.get('test'), 'test');

        await cache.invalidate('test');

        assert.strictEqual(await cache.get('test'), null);
    });

    await it('when the ttl of the value of the key is expired, should remove the key', async () => {
        await cache.set('test', 'test', { ttl: 10 });

        assert.strictEqual(await cache.get('test'), 'test');

        await wait(11);

        assert.strictEqual(await cache.get('test'), null);
    });
}

export {};
