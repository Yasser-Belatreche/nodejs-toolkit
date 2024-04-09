import { QuotaLimitsRepository } from '../core/domain/quota-limits-repository';
import { SessionCorrelationId } from '@lib/primitives/application-specific/session';
import { QuotaLimits } from '../core/domain/quota-limits';

class InMemoryQuotaLimitsRepository implements QuotaLimitsRepository {
    private readonly map = new Map<string, QuotaLimits>();

    async ofUser(userId: string, session: SessionCorrelationId): Promise<QuotaLimits | null> {
        return this.map.get(userId) ?? null;
    }

    async update(
        userId: string,
        limits: QuotaLimits,
        session: SessionCorrelationId,
    ): Promise<void> {
        this.map.set(userId, limits);
    }
}

export { InMemoryQuotaLimitsRepository };
