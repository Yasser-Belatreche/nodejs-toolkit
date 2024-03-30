import { Result } from '@lib/primitives/generic/patterns/result';

import { Quota } from './quota';
import { UserQuotaLimits } from './user-quota-limits';
import { TooManyRequestsException } from './exceptions/too-many-requests-exception';

export interface RateLimitingAlgorithm {
    request(
        userId: string,
        token: string,
        score: number,
        limits: UserQuotaLimits,
    ): Promise<Result<RemainingQuota, TooManyRequestsException>>;

    quota(userId: string, token: string, limits: UserQuotaLimits): Promise<RemainingQuota>;
}

export interface RemainingQuota {
    perSecond: Quota;
    perMinute: Quota;
    perHour: Quota;
    perDay: Quota;
}
