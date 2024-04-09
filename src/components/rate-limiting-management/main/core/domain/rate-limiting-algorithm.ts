import { Result } from '@lib/primitives/generic/patterns/result';

import { TooManyRequestsException } from './exceptions/too-many-requests-exception';

import { QuotaSummary } from './quota-summary';
import { QuotaLimits } from './quota-limits';

export interface RateLimitingAlgorithm {
    request(
        userId: string,
        token: string,
        score: number,
        limits: QuotaLimits,
    ): Promise<Result<QuotaSummary, TooManyRequestsException>>;

    quota(userId: string, token: string, limits: QuotaLimits): Promise<QuotaSummary>;
}
