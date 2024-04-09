import { Result } from '@lib/primitives/generic/patterns/result';
import { RedisClient } from '@lib/persistence/main/redis-persistence';

import { TooManyRequestsException } from '../exceptions/too-many-requests-exception';

import { QuotaSummary } from '../quota-summary';
import { QuotaLimits } from '../quota-limits';

import { RateLimitingAlgorithm } from '../rate-limiting-algorithm';

class SlidingWindowAlgorithm implements RateLimitingAlgorithm {
    private static _instance: SlidingWindowAlgorithm | undefined;

    static Instance(client: RedisClient): SlidingWindowAlgorithm {
        if (!this._instance) this._instance = new SlidingWindowAlgorithm(client);

        return this._instance;
    }

    private constructor(private readonly client: RedisClient) {}

    async request(
        userId: string,
        token: string,
        score: number,
        limits: QuotaLimits,
    ): Promise<Result<QuotaSummary, TooManyRequestsException>> {
        const now = Date.now();

        const baseKey = this.key(userId, token);

        await this.client.zRemRangeByScore(`${baseKey}:secondly`, '-inf', now - 1000);
        await this.client.zAdd(`${baseKey}:secondly`, { score: now, value: `${now}:${score}` });
        const secondScores = await this.client.zRangeByScore(`${baseKey}:secondly`, '-inf', '+inf');
        const consumedPerSecond = secondScores.reduce(
            (acc, curr) => acc + parseInt(curr.split(':')[1]),
            0,
        );
        await this.client.expire(`${baseKey}:secondly`, 2);

        await this.client.zRemRangeByScore(`${baseKey}:minutely`, '-inf', now - 60000);
        await this.client.zAdd(`${baseKey}:minutely`, { score: now, value: `${now}:${score}` });
        const minuteScores = await this.client.zRangeByScore(`${baseKey}:minutely`, '-inf', '+inf');
        const consumedPerMinute = minuteScores.reduce(
            (acc, curr) => acc + parseInt(curr.split(':')[1]),
            0,
        );
        await this.client.expire(`${baseKey}:minutely`, 61);

        await this.client.zRemRangeByScore(`${baseKey}:hourly`, '-inf', now - 3600000);
        await this.client.zAdd(`${baseKey}:hourly`, { score: now, value: `${now}:${score}` });
        const hourScores = await this.client.zRangeByScore(`${baseKey}:hourly`, '-inf', '+inf');
        const consumedPerHour = hourScores.reduce(
            (acc, curr) => acc + parseInt(curr.split(':')[1]),
            0,
        );
        await this.client.expire(`${baseKey}:hourly`, 3601);

        await this.client.zRemRangeByScore(`${baseKey}:daily`, '-inf', now - 86400000);
        await this.client.zAdd(`${baseKey}:daily`, { score: now, value: `${now}:${score}` });
        const dayScores = await this.client.zRangeByScore(`${baseKey}:daily`, '-inf', '+inf');
        const consumedPerDay = dayScores.reduce(
            (acc, curr) => acc + parseInt(curr.split(':')[1]),
            0,
        );
        await this.client.expire(`${baseKey}:daily`, 86401);

        const overLimit =
            consumedPerSecond > limits.perSecond ||
            consumedPerMinute > limits.perMinute ||
            consumedPerHour > limits.perHour ||
            consumedPerDay > limits.perDay;

        if (overLimit) {
            await this.client.zRemRangeByScore(`${baseKey}:secondly`, now, `(${now}`);
            await this.client.zRemRangeByScore(`${baseKey}:minutely`, now, `(${now}`);
            await this.client.zRemRangeByScore(`${baseKey}:hourly`, now, `(${now}`);
            await this.client.zRemRangeByScore(`${baseKey}:daily`, now, `(${now}`);

            return Result.Fail(new TooManyRequestsException());
        }

        const remaining = {
            perSecond: limits.perSecond - consumedPerSecond,
            perMinute: limits.perMinute - consumedPerMinute,
            perHour: limits.perHour - consumedPerHour,
            perDay: limits.perDay - consumedPerDay,
        };

        return Result.Ok({
            perSecond: {
                limit: limits.perSecond,
                remaining: remaining.perSecond,
                reset: new Date(now + 1000),
            },
            perMinute: {
                limit: limits.perMinute,
                remaining: remaining.perMinute,
                reset: new Date(now + 60000),
            },
            perHour: {
                limit: limits.perHour,
                remaining: remaining.perHour,
                reset: new Date(now + 3600000),
            },
            perDay: {
                limit: limits.perDay,
                remaining: remaining.perDay,
                reset: new Date(now + 86400000),
            },
        });
    }

    async quota(userId: string, token: string, limits: QuotaLimits): Promise<QuotaSummary> {
        const baseKey = this.key(userId, token);

        const now = Date.now();

        await this.client.zRemRangeByScore(`${baseKey}:secondly`, '-inf', now - 1000);
        await this.client.zRemRangeByScore(`${baseKey}:minutely`, '-inf', now - 60000);
        await this.client.zRemRangeByScore(`${baseKey}:hourly`, '-inf', now - 3600000);
        await this.client.zRemRangeByScore(`${baseKey}:daily`, '-inf', now - 86400000);

        const secondScores = await this.client.zRangeByScore(`${baseKey}:secondly`, '-inf', '+inf');
        const consumedPerSecond = secondScores.reduce((acc, curr) => acc + parseInt(curr), 0);

        const minuteScores = await this.client.zRangeByScore(`${baseKey}:minutely`, '-inf', '+inf');
        const consumedPerMinute = minuteScores.reduce((acc, curr) => acc + parseInt(curr), 0);

        const hourScores = await this.client.zRangeByScore(`${baseKey}:hourly`, '-inf', '+inf');
        const consumedPerHour = hourScores.reduce((acc, curr) => acc + parseInt(curr), 0);

        const dayScores = await this.client.zRangeByScore(`${baseKey}:daily`, '-inf', '+inf');
        const consumedPerDay = dayScores.reduce((acc, curr) => acc + parseInt(curr), 0);

        const remaining = {
            perSecond: limits.perSecond - consumedPerSecond,
            perMinute: limits.perMinute - consumedPerMinute,
            perHour: limits.perHour - consumedPerHour,
            perDay: limits.perDay - consumedPerDay,
        };

        return {
            perSecond: {
                limit: limits.perSecond,
                remaining: remaining.perSecond,
                reset: new Date(now + 1000),
            },
            perMinute: {
                limit: limits.perMinute,
                remaining: remaining.perMinute,
                reset: new Date(now + 60000),
            },
            perHour: {
                limit: limits.perHour,
                remaining: remaining.perHour,
                reset: new Date(now + 3600000),
            },
            perDay: {
                limit: limits.perDay,
                remaining: remaining.perDay,
                reset: new Date(now + 86400000),
            },
        };
    }

    private key(userId: string, token: string): string {
        return `rate-limiting:sliding-window:${userId}:${token}`;
    }
}

export { SlidingWindowAlgorithm };
