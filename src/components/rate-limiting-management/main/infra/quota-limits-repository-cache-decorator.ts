import { Cache } from '@lib/cache/main/cache';
import { TimeCalculator } from '@lib/primitives/generic/helpers/time-calculator';
import { SessionCorrelationId } from '@lib/primitives/application-specific/session';

import { QuotaLimits } from '../core/domain/quota-limits';
import { QuotaLimitsRepository } from '../core/domain/quota-limits-repository';

class QuotaLimitsRepositoryCacheDecorator implements QuotaLimitsRepository {
    constructor(
        private readonly cache: Cache,
        private readonly repository: QuotaLimitsRepository,
    ) {}

    async ofUser(userId: string, session: SessionCorrelationId): Promise<QuotaLimits | null> {
        const key = `quota-limits:${userId}`;
        const cached = await this.cache.get(key);

        if (cached) {
            return cached as QuotaLimits;
        }

        const limits = await this.repository.ofUser(userId, session);

        if (limits) {
            const ONE_DAY = TimeCalculator.Instance().days(1).inMilliseconds();

            await this.cache.set(key, limits, { ttl: ONE_DAY });
        }

        return limits;
    }

    async update(
        userId: string,
        limits: QuotaLimits,
        session: SessionCorrelationId,
    ): Promise<void> {
        await this.repository.update(userId, limits, session);

        const key = `quota-limits:${userId}`;

        const ONE_DAY = TimeCalculator.Instance().days(1).inMilliseconds();

        await this.cache.set(key, limits, { ttl: ONE_DAY });
    }
}

export { QuotaLimitsRepositoryCacheDecorator };
