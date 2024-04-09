import { OptionalProperties } from '@lib/primitives/generic/types/optional-property';

import { ThrottleCommand } from './core/usecases/throttle/throttle-command';
import { ThrottleCommandResponse } from './core/usecases/throttle/throttle-command-response';

import { ChangeQuotaLimitsCommand } from './core/usecases/change-quota-limits/change-quota-limits-command';
import { ChangeQuotaLimitsCommandResponse } from './core/usecases/change-quota-limits/change-quota-limits-command-response';

import { GetQuotaLimitsQuery } from './core/usecases/get-quota-limits/get-quota-limits-query';
import { GetQuotaLimitsQueryResponse } from './core/usecases/get-quota-limits/get-quota-limits-query-response';

import { GetQuotaSummaryQuery } from './core/usecases/get-quota-summary/get-quota-summary-query';
import { GetQuotaSummaryQueryResponse } from './core/usecases/get-quota-summary/get-quota-summary-query-response';

export interface RateLimitingManager {
    throttle(command: ThrottleCommand): Promise<ThrottleCommandResponse>;

    getQuotaLimits(
        query: OptionalProperties<GetQuotaLimitsQuery, 'userId'>,
    ): Promise<GetQuotaLimitsQueryResponse>;

    changeQuotaLimits(command: ChangeQuotaLimitsCommand): Promise<ChangeQuotaLimitsCommandResponse>;

    getQuotaSummary(
        query: OptionalProperties<GetQuotaSummaryQuery, 'userId'>,
    ): Promise<GetQuotaSummaryQueryResponse>;
}
