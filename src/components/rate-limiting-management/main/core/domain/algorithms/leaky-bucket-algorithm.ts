import { Result } from '@lib/primitives/generic/patterns/result';
import { DeveloperException } from '@lib/primitives/application-specific/exceptions/developer-exception';

import { UserQuotaLimits } from '../user-quota-limits';
import { RateLimitingAlgorithm, RemainingQuota } from '../rate-limiting-algorithm';

import { TooManyRequestsException } from '../exceptions/too-many-requests-exception';

interface Config {
    capacity: number;
    leaksPerSecond: number;
}

type PromiseResolver = (remaining: RemainingQuota) => void;

class LeakyBucketAlgorithm implements RateLimitingAlgorithm {
    private static _instance: LeakyBucketAlgorithm;

    static Instance(config: Config): LeakyBucketAlgorithm {
        if (!this._instance) this._instance = new LeakyBucketAlgorithm(config);

        return this._instance;
    }

    private readonly interval: NodeJS.Timeout;
    private readonly map = new Map<
        string,
        Array<{ limits: UserQuotaLimits; resolver: PromiseResolver }>
    >();

    private constructor(private readonly config: Config) {
        if (config.leaksPerSecond < 1)
            throw new DeveloperException(
                'INVALID_CONFIGURATION',
                'The leaks per second must be greater than 0',
            );

        const handler = (): void => {
            for (const [key, requests] of this.map) {
                if (!requests.length) continue;

                const { userId, token } = this.reverseKey(key);
                const remainings = this.calculateRemainings(userId, token);

                let passedRequests = 0;

                for (const { resolver, limits } of requests) {
                    if (passedRequests >= this.config.leaksPerSecond) break;

                    passedRequests++;

                    resolver({
                        perSecond: {
                            limit: limits.perSecond,
                            remaining: remainings.perSecond + passedRequests,
                            reset: new Date(Date.now() + 1000),
                        },
                        perMinute: {
                            limit: limits.perMinute,
                            remaining: remainings.perMinute + passedRequests,
                            reset: new Date(Date.now() + 1000),
                        },
                        perHour: {
                            limit: limits.perHour,
                            remaining: remainings.perHour + passedRequests,
                            reset: new Date(Date.now() + 1000),
                        },
                        perDay: {
                            limit: limits.perDay,
                            remaining: remainings.perDay + passedRequests,
                            reset: new Date(Date.now() + 1000),
                        },
                    });
                }

                this.map.set(key, requests.slice(passedRequests));
            }
        };

        this.interval = setInterval(() => {
            handler();
        }, 1000);
    }

    async request(
        userId: string,
        token: string,
        score: number,
        limits: UserQuotaLimits,
    ): Promise<Result<RemainingQuota, TooManyRequestsException>> {
        const key = this.key(userId, token);

        if (!this.map.has(key)) this.map.set(key, []);

        if (this.map.get(key)!.length >= this.config.capacity)
            return Result.Fail(new TooManyRequestsException());

        let resolver: PromiseResolver;

        const promise = new Promise<RemainingQuota>(resolve => {
            resolver = (remaining: RemainingQuota) => resolve(remaining);
        });

        this.map.get(key)!.push({ limits, resolver: resolver! });

        return Result.Ok(await promise);
    }

    async quota(userId: string, token: string, limits: UserQuotaLimits): Promise<RemainingQuota> {
        const requests = this.map.get(this.key(userId, token));
        const remainings = this.calculateRemainings(userId, token);

        return {
            perDay: {
                limit: limits.perDay,
                remaining: remainings.perDay,
                reset: requests ? new Date(Date.now() + 1000) : null,
            },
            perHour: {
                limit: limits.perHour,
                remaining: remainings.perHour,
                reset: requests ? new Date(Date.now() + 1000) : null,
            },
            perMinute: {
                limit: limits.perMinute,
                remaining: remainings.perMinute,
                reset: requests ? new Date(Date.now() + 1000) : null,
            },
            perSecond: {
                limit: limits.perSecond,
                remaining: remainings.perSecond,
                reset: requests ? new Date(Date.now() + 1000) : null,
            },
        };
    }

    stop(): void {
        this.map.clear();
        clearInterval(this.interval);
    }

    private calculateRemainings(
        userId: string,
        token: string,
    ): { perDay: number; perHour: number; perMinute: number; perSecond: number } {
        const key = this.key(userId, token);

        const queuedRequests = this.map.get(key);

        if (!queuedRequests)
            return {
                perSecond: this.config.capacity,
                perMinute: this.config.leaksPerSecond * 60 + this.config.capacity,
                perHour: this.config.leaksPerSecond * 60 * 60 + this.config.capacity,
                perDay: this.config.leaksPerSecond * 60 * 60 * 24 + this.config.capacity,
            };

        return {
            perSecond: this.config.capacity - queuedRequests.length,
            perMinute:
                this.config.leaksPerSecond * 60 + this.config.capacity - queuedRequests.length,
            perHour:
                this.config.leaksPerSecond * 60 * 60 + this.config.capacity - queuedRequests.length,
            perDay:
                this.config.leaksPerSecond * 60 * 60 * 24 +
                this.config.capacity -
                queuedRequests.length,
        };
    }

    private key(userId: string, token: string): string {
        return `${userId}:${token}`;
    }

    private reverseKey(key: string): { userId: string; token: string } {
        const [userId, token] = key.split(':');

        return { userId, token };
    }
}

export { LeakyBucketAlgorithm };
