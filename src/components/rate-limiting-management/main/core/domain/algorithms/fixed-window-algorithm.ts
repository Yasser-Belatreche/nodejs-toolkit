import { Result } from '@lib/primitives/generic/patterns/result';
import { RedisClient } from '@lib/persistence/main/redis-persistence';

import { TooManyRequestsException } from '../exceptions/too-many-requests-exception';

import { QuotaSummary } from '../quota-summary';
import { QuotaLimits } from '../quota-limits';

import { RateLimitingAlgorithm } from '../rate-limiting-algorithm';

class FixedWindowAlgorithm implements RateLimitingAlgorithm {
    private static _instance: FixedWindowAlgorithm | undefined;

    static Instance(client: RedisClient): FixedWindowAlgorithm {
        if (!this._instance) this._instance = new FixedWindowAlgorithm(client);

        return this._instance;
    }

    private constructor(private readonly client: RedisClient) {}

    async request(
        userId: string,
        token: string,
        score: number,
        limits: QuotaLimits,
    ): Promise<Result<QuotaSummary, TooManyRequestsException>> {
        const baseKey = this.key(userId, token);

        const now = Date.now();

        const second = Math.trunc(now / 1000) * 1000;
        const minute = Math.trunc(now / 60000) * 60000;
        const hour = Math.trunc(now / 3600000) * 3600000;
        const day = Math.trunc(now / 86400000) * 86400000;

        const consumedPerSecond = await this.client.incrBy(`${baseKey}:secondly:${second}`, score);
        const consumedPerMinute = await this.client.incrBy(`${baseKey}:minutely:${minute}`, score);
        const consumedPerHour = await this.client.incrBy(`${baseKey}:hourly:${hour}`, score);
        const consumedPerDay = await this.client.incrBy(`${baseKey}:daily:${day}`, score);

        await this.client.expire(`${baseKey}:secondly:${second}`, 2);
        await this.client.expire(`${baseKey}:minutely:${minute}`, 61);
        await this.client.expire(`${baseKey}:hourly:${hour}`, 3601);
        await this.client.expire(`${baseKey}:daily:${day}`, 86401);

        const overLimit =
            consumedPerSecond > limits.perSecond ||
            consumedPerMinute > limits.perMinute ||
            consumedPerHour > limits.perHour ||
            consumedPerDay > limits.perDay;

        if (overLimit) {
            await this.client.decrBy(`${baseKey}:secondly:${second}`, score);
            await this.client.decrBy(`${baseKey}:minutely:${minute}`, score);
            await this.client.decrBy(`${baseKey}:hourly:${hour}`, score);
            await this.client.decrBy(`${baseKey}:daily:${day}`, score);

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
                reset: new Date(second + 1000),
            },
            perMinute: {
                limit: limits.perMinute,
                remaining: remaining.perMinute,
                reset: new Date(minute + 60000),
            },
            perHour: {
                limit: limits.perHour,
                remaining: remaining.perHour,
                reset: new Date(hour + 3600000),
            },
            perDay: {
                limit: limits.perDay,
                remaining: remaining.perDay,
                reset: new Date(day + 86400000),
            },
        });
    }

    async quota(userId: string, token: string, limits: QuotaLimits): Promise<QuotaSummary> {
        const baseKey = this.key(userId, token);

        const now = Date.now();

        const second = Math.trunc(now / 1000) * 1000;
        const minute = Math.trunc(now / 60000) * 60000;
        const hour = Math.trunc(now / 3600000) * 3600000;
        const day = Math.trunc(now / 86400000) * 86400000;

        const consumedPerSecond = await this.client.get(`${baseKey}:secondly:${second}`);
        const consumedPerMinute = await this.client.get(`${baseKey}:minutely:${minute}`);
        const consumedPerHour = await this.client.get(`${baseKey}:hourly:${hour}`);
        const consumedPerDay = await this.client.get(`${baseKey}:daily:${day}`);

        const remaining = {
            perSecond: limits.perSecond - Number(consumedPerSecond),
            perMinute: limits.perMinute - Number(consumedPerMinute),
            perHour: limits.perHour - Number(consumedPerHour),
            perDay: limits.perDay - Number(consumedPerDay),
        };

        return {
            perSecond: {
                limit: limits.perSecond,
                remaining: remaining.perSecond,
                reset: new Date(second + 1000),
            },
            perMinute: {
                limit: limits.perMinute,
                remaining: remaining.perMinute,
                reset: new Date(minute + 60000),
            },
            perHour: {
                limit: limits.perHour,
                remaining: remaining.perHour,
                reset: new Date(hour + 3600000),
            },
            perDay: {
                limit: limits.perDay,
                remaining: remaining.perDay,
                reset: new Date(day + 86400000),
            },
        };
    }

    private key(userId: string, token: string): string {
        return `rate-limiting:fixed-window:${userId}:${token}`;
    }
}

export { FixedWindowAlgorithm };
