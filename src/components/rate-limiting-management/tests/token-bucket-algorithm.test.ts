import assert from 'node:assert';
import { faker } from '@faker-js/faker';
import { after, before, beforeEach, describe, it } from 'node:test';

import { Library } from '@lib/library';
import { wait } from '@lib/primitives/generic/helpers/wait';
import { PersistenceFactory } from '@lib/persistence/main/persistence-factory';

import { defaultQuotaLimits } from '../main/core/domain/quota-limits';
import { TokenBucketAlgorithm } from '../main/core/domain/algorithms/token-bucket-algorithm';

await describe('Token Bucket Algorithm', async () => {
    let userId: string;
    const capacity = 10;
    const fillRate = 3;
    const limits = defaultQuotaLimits;
    const algorithm = TokenBucketAlgorithm.Instance({ capacity, fillRate }, Library.aRedisClient());

    beforeEach(() => {
        userId = faker.string.uuid();
    });

    before(async () => {
        await PersistenceFactory.aRedisPersistence().connect();
    });

    after(async () => {
        await PersistenceFactory.aRedisPersistence().disconnect();

        algorithm.stop();
    });

    await it('should accept all the requests that does not pass the total capacity limit, and should reject anything that pass that', async () => {
        for (let i = 0; i < capacity; i++) {
            const res = await algorithm.request(userId, 'token', 1, limits);

            assert.equal(res.success(), true);
        }

        const overLimitRequest = await algorithm.request(userId, 'token', 1, limits);

        assert.equal(overLimitRequest.success(), false);
    });

    await it('should fill the bucket at the rate of the fill rate and be able to accept more requests', async () => {
        for (let i = 0; i < capacity; i++) {
            await algorithm.request(userId, 'token', 1, limits);
        }

        const overLimitRequest = await algorithm.request(userId, 'token', 1, limits);
        assert.equal(overLimitRequest.success(), false);

        await wait(1000);

        for (let i = 0; i < fillRate; i++) {
            const res = await algorithm.request(userId, 'token', 1, limits);

            assert.equal(res.success(), true);
        }

        const overLimitRequest2 = await algorithm.request(userId, 'token', 1, limits);

        assert.equal(overLimitRequest2.success(), false);
    });

    await it("different users should not affect each other's quota", async () => {
        const userId2 = faker.string.uuid();

        for (let i = 0; i < capacity; i++) {
            const res = await algorithm.request(userId, 'token', 1, limits);

            assert.equal(res.success(), true);
        }

        for (let i = 0; i < capacity; i++) {
            const res = await algorithm.request(userId2, 'token', 1, limits);

            assert.equal(res.success(), true);
        }

        const overLimitRequest = await algorithm.request(userId, 'token', 1, limits);
        const overLimitRequest2 = await algorithm.request(userId2, 'token', 1, limits);

        assert.equal(overLimitRequest.success(), false);
        assert.equal(overLimitRequest2.success(), false);
    });
});
