import { Result } from '@lib/primitives/generic/patterns/result';
import { RedisClient } from '@lib/persistence/main/redis-persistence';

import { TooManyRequestsException } from '../exceptions/too-many-requests-exception';

import { UserQuotaLimits } from '../user-quota-limits';
import { RateLimitingAlgorithm, RemainingQuota } from '../rate-limiting-algorithm';
import { DeveloperException } from '@lib/primitives/application-specific/exceptions/developer-exception';

interface Config {
    capacity: number;
    fillRate: number; // tokens per second
}

class TokenBucketAlgorithm implements RateLimitingAlgorithm {
    private static _instance: TokenBucketAlgorithm;

    static Instance(config: Config, client: RedisClient): TokenBucketAlgorithm {
        if (!this._instance) this._instance = new TokenBucketAlgorithm(config, client);

        return this._instance;
    }

    private readonly interval: NodeJS.Timeout;

    constructor(
        private readonly config: Config,
        private readonly client: RedisClient,
    ) {
        this.interval = this.setup();
    }

    async request(
        userId: string,
        token: string,
        score: number,
        limits: UserQuotaLimits,
    ): Promise<Result<RemainingQuota, TooManyRequestsException>> {
        const key = this.key(userId, token);

        const consumed = await this.client.incrBy(key, score);

        if (consumed > this.config.capacity) {
            await this.client.decrBy(key, score);

            return Result.Fail(new TooManyRequestsException());
        }

        const remaining = await this.calculateRemaining(userId, token, consumed);

        return Result.Ok({
            perSecond: {
                limit: limits.perSecond,
                remaining: remaining.perSecond,
                reset: new Date(Date.now() + 1000),
            },
            perMinute: {
                limit: limits.perMinute,
                remaining: remaining.perMinute,
                reset: new Date(Date.now() + 1000),
            },
            perHour: {
                limit: limits.perHour,
                remaining: remaining.perHour,
                reset: new Date(Date.now() + 1000),
            },
            perDay: {
                limit: limits.perDay,
                remaining: remaining.perDay,
                reset: new Date(Date.now() + 1000),
            },
        });
    }

    async quota(userId: string, token: string, limits: UserQuotaLimits): Promise<RemainingQuota> {
        const remaining = await this.calculateRemaining(userId, token);

        return {
            perSecond: {
                limit: limits.perSecond,
                remaining: remaining.perSecond,
                reset: new Date(Date.now() + 1000),
            },
            perMinute: {
                limit: limits.perMinute,
                remaining: remaining.perMinute,
                reset: new Date(Date.now() + 1000),
            },
            perHour: {
                limit: limits.perHour,
                remaining: remaining.perHour,
                reset: new Date(Date.now() + 1000),
            },
            perDay: {
                limit: limits.perDay,
                remaining: remaining.perDay,
                reset: new Date(Date.now() + 1000),
            },
        };
    }

    stop(): void {
        clearInterval(this.interval);
    }

    private key(userId: string, token: string): string {
        return `rate-limiting:${userId}:${token}`;
    }

    private async calculateRemaining(
        userId: string,
        token: string,
        consumed?: number,
    ): Promise<{ perDay: number; perHour: number; perMinute: number; perSecond: number }> {
        if (consumed === undefined) {
            const value = await this.client.get(this.key(userId, token));

            if (!value) consumed = 0;
            else consumed = Number(value);
        }

        const remaining = this.config.capacity - consumed;

        return {
            perDay: remaining,
            perSecond: remaining,
            perHour: remaining,
            perMinute: remaining,
        };
    }

    private setup(): NodeJS.Timeout {
        return setInterval(() => {
            this.resetRates()
                .catch(e => {
                    throw new DeveloperException(
                        'RATE_LIMITING.TOKEN_BUCKET_ALGORITHM.RESET_RATES_FAILED',
                        e,
                    );
                })
                .finally(() => {});
        }, 1000);
    }

    private async resetRates(): Promise<void> {
        const luaScript = `
            local keys = redis.call('KEYS', 'rate-limiting:*')
            local fillRate = tonumber(ARGV[1])
            
            for i, key in ipairs(keys) do
                local newValue = redis.call('DECRBY', key, fillRate)
                if newValue < 0 then
                    redis.call('SET', key, 0)
                end
            end 
        `;

        await this.client.eval(luaScript, { arguments: [this.config.fillRate.toString()] });
    }
}

export { TokenBucketAlgorithm };
