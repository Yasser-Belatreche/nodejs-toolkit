import assert from 'node:assert';
import { faker } from '@faker-js/faker';
import { after, before, beforeEach, describe, it } from 'node:test';

import { Library } from '@lib/library';
import { wait } from '@lib/primitives/generic/helpers/wait';
import { PersistenceFactory } from '@lib/persistence/main/persistence-factory';

import { defaultQuotaLimits } from '../main/core/domain/quota-limits';
import { FixedWindowAlgorithm } from '../main/core/domain/algorithms/fixed-window-algorithm';

await describe('Fixed Window Algorithm', async () => {
    let userId: string;
    let token: string;
    const limits = defaultQuotaLimits;
    const algorithm = FixedWindowAlgorithm.Instance(Library.aRedisClient());

    beforeEach(() => {
        userId = faker.string.uuid();
        token = faker.string.uuid();
    });

    before(async () => {
        await PersistenceFactory.aRedisPersistence().connect();
    });

    after(async () => {
        await PersistenceFactory.aRedisPersistence().disconnect();
    });

    await it('should accept and pass requests until reaching the per seconds limit of the user', async () => {
        for (let i = 0; i < limits.perSecond; i++) {
            const res = await algorithm.request(userId, token, 1, limits);

            assert.ok(res.success());
        }

        const overQuotaRequest = await algorithm.request(userId, token, 1, limits);

        assert.ok(!overQuotaRequest.success());
    });

    await it('the score passed should act as a weight for the request and should reduce the remaining requests according to the score', async () => {
        const res = await algorithm.request(userId, token, limits.perSecond, limits);

        const { perSecond } = res.unpack();

        assert.equal(perSecond.remaining, 0);
    });

    await it('should accept more requests after 1 second', async () => {
        for (let i = 0; i < limits.perSecond; i++) {
            await algorithm.request(userId, token, 1, limits);
        }

        await wait(1000);

        const res = await algorithm.request(userId, token, 1, limits);

        assert.ok(res.success());
    });

    await it('different users should not affect each others, and also the same user with another token', async () => {
        const userId2 = faker.string.uuid();
        const token2 = faker.string.uuid();

        for (let i = 0; i < limits.perSecond; i++) {
            const res = await algorithm.request(userId, token, 1, limits);

            assert.ok(res.success());
        }

        for (let i = 0; i < limits.perSecond; i++) {
            const res = await algorithm.request(userId, token2, 1, limits);

            assert.ok(res.success());
        }

        for (let i = 0; i < limits.perSecond; i++) {
            const res = await algorithm.request(userId2, token, 1, limits);

            assert.ok(res.success());
        }
    });
});
