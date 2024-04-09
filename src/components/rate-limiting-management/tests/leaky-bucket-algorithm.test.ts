import assert from 'node:assert';
import { faker } from '@faker-js/faker';
import { after, beforeEach, describe, it } from 'node:test';

import { wait } from '@lib/primitives/generic/helpers/wait';
import { PromiseState } from '@lib/primitives/generic/helpers/promise-state';

import { defaultQuotaLimits } from '../main/core/domain/quota-limits';

import { LeakyBucketAlgorithm } from '../main/core/domain/algorithms/leaky-bucket-algorithm';

await describe('Leaky Bucket Algorithm', async () => {
    let userId: string;
    const capacity = 10;
    const leaksPerSecond = 2;
    const limits = defaultQuotaLimits;
    const algorithm = LeakyBucketAlgorithm.Instance({ capacity, leaksPerSecond });

    beforeEach(() => {
        userId = faker.string.uuid();
    });

    after(() => {
        algorithm.stop();
    });

    await it('should not accept requests more than the capacity per user per token', async () => {
        const requests: Array<ReturnType<(typeof algorithm)['request']>> = [];

        for (let i = 0; i < capacity + 2; i++) {
            requests.push(algorithm.request(userId, 'token', 1, limits));
        }

        const overLimitRequest = await requests[capacity];
        const overLimitRequest2 = await requests[capacity + 1];

        assert.equal(overLimitRequest.success(), false);
        assert.equal(overLimitRequest2.success(), false);
    });

    await it("should accept requests if they don't exceed the capacity per user per token and pass them 2 requests every second in the order they enter", async () => {
        const requests: Array<ReturnType<(typeof algorithm)['request']>> = [];

        for (let i = 0; i < 4; i++) {
            requests.push(algorithm.request(userId, 'token', 1, limits));
        }

        assert.ok((await PromiseState(requests[0])) === 'pending');
        assert.ok((await PromiseState(requests[1])) === 'pending');
        assert.ok((await PromiseState(requests[2])) === 'pending');
        assert.ok((await PromiseState(requests[3])) === 'pending');

        await wait(1000);

        assert.ok((await PromiseState(requests[0])) === 'fulfilled');
        assert.ok((await PromiseState(requests[1])) === 'fulfilled');
        assert.ok((await PromiseState(requests[2])) === 'pending');
        assert.ok((await PromiseState(requests[3])) === 'pending');

        await wait(1000);

        assert.ok((await PromiseState(requests[0])) === 'fulfilled');
        assert.ok((await PromiseState(requests[1])) === 'fulfilled');
        assert.ok((await PromiseState(requests[2])) === 'fulfilled');
        assert.ok((await PromiseState(requests[3])) === 'fulfilled');
    });
});
