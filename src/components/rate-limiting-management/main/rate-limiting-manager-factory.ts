import { Cache } from '@lib/cache/main/cache';

import { RateLimitingManager } from './rate-limiting-manager';
import { RateLimitingManagerFacade } from './rate-limiting-manager-facade';
import { RateLimitingManagerAuthorizationAndLoggerDecorator } from './rate-limiting-manager-authorization-and-logger-decorator';

import { LeakyBucketAlgorithm } from './core/domain/algorithms/leaky-bucket-algorithm';

import { InMemoryQuotaLimitsRepository } from './infra/in-memory-quota-limits-repository';
import { QuotaLimitsRepositoryCacheDecorator } from './infra/quota-limits-repository-cache-decorator';

const RateLimitingManagerFactory = {
    anInstance(cache: Cache): RateLimitingManager {
        return new RateLimitingManagerAuthorizationAndLoggerDecorator(
            new RateLimitingManagerFacade(
                LeakyBucketAlgorithm.Instance({ capacity: 100, leaksPerSecond: 10 }),
                new QuotaLimitsRepositoryCacheDecorator(cache, new InMemoryQuotaLimitsRepository()),
            ),
        );
    },
};

export { RateLimitingManagerFactory };
