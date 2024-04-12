import { Result } from '@lib/primitives/generic/patterns/result';
import { DeveloperException } from '@lib/primitives/application-specific/exceptions/developer-exception';

import { QuotaSummary } from '../quota-summary';
import { QuotaLimits } from '../quota-limits';

import { TooManyRequestsException } from '../exceptions/too-many-requests-exception';

import { RateLimitingAlgorithm } from '../rate-limiting-algorithm';

interface Config {
    capacity: number;
    leaksPerSecond: number;
}

type PromiseResolver = (remaining: QuotaSummary) => void;

class LeakyBucketAlgorithm implements RateLimitingAlgorithm {
    private static _instance: LeakyBucketAlgorithm;

    static Instance(config: Config): LeakyBucketAlgorithm {
        if (!this._instance) this._instance = new LeakyBucketAlgorithm(config);

        return this._instance;
    }

    private readonly interval: NodeJS.Timeout;
    private readonly map = new Map<
        string,
        Array<{ limits: QuotaLimits; resolver: PromiseResolver }>
    >();

    private constructor(private readonly config: Config) {
        if (config.capacity < 1)
            throw new DeveloperException(
                'INVALID_CONFIGURATION',
                'The capacity must be greater than 0',
            );

        if (config.leaksPerSecond < 1)
            throw new DeveloperException(
                'INVALID_CONFIGURATION',
                'The leaks per second must be greater than 0',
            );

        this.interval = this.setup();
    }

    async request(
        userId: string,
        token: string,
        score: number,
        limits: QuotaLimits,
    ): Promise<Result<QuotaSummary, TooManyRequestsException>> {
        const key = this.key(userId, token);

        if (!this.map.has(key)) this.map.set(key, []);

        if (this.map.get(key)!.length >= this.config.capacity)
            return Result.Fail(new TooManyRequestsException());

        let resolver: PromiseResolver;

        const promise = new Promise<QuotaSummary>(resolve => {
            resolver = (remaining: QuotaSummary) => resolve(remaining);
        });

        this.map.get(key)!.push({ limits, resolver: resolver! });

        return Result.Ok(await promise);
    }

    async quota(userId: string, token: string, limits: QuotaLimits): Promise<QuotaSummary> {
        const requests = this.map.get(this.key(userId, token));
        const remaining = this.calculateRemaining(userId, token);

        return {
            perDay: {
                limit: limits.perDay,
                remaining: remaining.perDay,
                reset: requests ? new Date(Date.now() + 1000) : null,
            },
            perHour: {
                limit: limits.perHour,
                remaining: remaining.perHour,
                reset: requests ? new Date(Date.now() + 1000) : null,
            },
            perMinute: {
                limit: limits.perMinute,
                remaining: remaining.perMinute,
                reset: requests ? new Date(Date.now() + 1000) : null,
            },
            perSecond: {
                limit: limits.perSecond,
                remaining: remaining.perSecond,
                reset: requests ? new Date(Date.now() + 1000) : null,
            },
        };
    }

    stop(): void {
        this.map.clear();
        clearInterval(this.interval);
    }

    private calculateRemaining(
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

    private setup(): NodeJS.Timeout {
        const handler = (): void => {
            for (const [key, requests] of this.map) {
                if (!requests.length) continue;

                const { userId, token } = this.reverseKey(key);
                const remaining = this.calculateRemaining(userId, token);

                let passedRequests = 0;

                for (const { resolver, limits } of requests) {
                    if (passedRequests >= this.config.leaksPerSecond) break;

                    passedRequests++;

                    resolver({
                        perSecond: {
                            limit: limits.perSecond,
                            remaining: remaining.perSecond + passedRequests,
                            reset: new Date(Date.now() + 1000),
                        },
                        perMinute: {
                            limit: limits.perMinute,
                            remaining: remaining.perMinute + passedRequests,
                            reset: new Date(Date.now() + 1000),
                        },
                        perHour: {
                            limit: limits.perHour,
                            remaining: remaining.perHour + passedRequests,
                            reset: new Date(Date.now() + 1000),
                        },
                        perDay: {
                            limit: limits.perDay,
                            remaining: remaining.perDay + passedRequests,
                            reset: new Date(Date.now() + 1000),
                        },
                    });
                }

                this.map.set(key, requests.slice(passedRequests));
            }
        };

        return setInterval(() => {
            handler();
        }, 1000);
    }
}

export { LeakyBucketAlgorithm };
