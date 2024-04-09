import { SessionCorrelationId } from '@lib/primitives/application-specific/session';

import { QuotaLimits } from './quota-limits';

export interface QuotaLimitsRepository {
    ofUser(userId: string, session: SessionCorrelationId): Promise<QuotaLimits | null>;

    update(userId: string, limits: QuotaLimits, session: SessionCorrelationId): Promise<void>;
}
