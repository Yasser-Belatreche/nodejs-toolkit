import assert from 'node:assert';
import { faker } from '@faker-js/faker';
import { describe, it, afterEach, before, after } from 'node:test';

import { Library } from '@lib/library';
import { wait } from '@lib/primitives/generic/helpers/wait';
import { PersistenceFactory } from '@lib/persistence/main/persistence-factory';

import { Cache } from '../main/cache';

import { RedisCache } from '../main/redis-cache';
import { InMemoryCache } from '../main/in-memory-cache';

await describe('cache test', async () => {
    const providers: Cache[] = [
        InMemoryCache.Instance(),
        RedisCache.Instance(Library.aRedisClient()),
    ];

    before(async () => {
        await PersistenceFactory.aRedisPersistence().connect();
    });

    after(async () => {
        await PersistenceFactory.aRedisPersistence().disconnect();
    });

    for (const cache of providers) {
        await describe(cache.constructor.name, async () => {
            await testCasesOn(cache);
        });
    }
});

async function testCasesOn(cache: Cache): Promise<void> {
    afterEach(async () => {
        await cache.clear();
    });

    await it('should save stuff and be able to retreive them', async t => {
        await cache.set('test', 'test');
        assert.strictEqual(await cache.get('test'), 'test');

        const number = faker.number.int();
        await cache.set('number', number);
        assert.strictEqual(await cache.get<number>('number'), number);

        const obj = { test: 'test' };
        await cache.set('obj', obj);
        assert.deepStrictEqual(await cache.get('obj'), obj);
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

    await it('should not override the value if exists when using setNx until it expires', async t => {
        const bool = await cache.setNx('test', 'test', { ttl: 10 });

        assert.ok(bool);
        assert.strictEqual(await cache.get('test'), 'test');

        const bool2 = await cache.setNx('test', 'test2');

        assert.ok(!bool2);
        assert.strictEqual(await cache.get('test'), 'test');

        await wait(11);

        const bool3 = await cache.setNx('test', 'test2');

        assert.ok(bool3);
        assert.strictEqual(await cache.get('test'), 'test2');
    });
}
