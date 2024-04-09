import { Log } from '@lib/logger/main/log-decorator';
import { OptionalProperties } from '@lib/primitives/generic/types/optional-property';
import { GetComponentActionLogMessage } from '@lib/primitives/application-specific/consistency/log-messages';

import { Authorize } from '../../auth-management/main/authorize-decorator';

import { RateLimitingManager } from './rate-limiting-manager';
import { RateLimitingPermissions } from './rate-limiting-manager-permissions';

import { GetQuotaLimitsQuery } from './core/usecases/get-quota-limits/get-quota-limits-query';
import { GetQuotaLimitsQueryResponse } from './core/usecases/get-quota-limits/get-quota-limits-query-response';

import { ChangeQuotaLimitsCommand } from './core/usecases/change-quota-limits/change-quota-limits-command';
import { ChangeQuotaLimitsCommandResponse } from './core/usecases/change-quota-limits/change-quota-limits-command-response';

import { GetQuotaSummaryQuery } from './core/usecases/get-quota-summary/get-quota-summary-query';
import { GetQuotaSummaryQueryResponse } from './core/usecases/get-quota-summary/get-quota-summary-query-response';

import { ThrottleCommand } from './core/usecases/throttle/throttle-command';
import { ThrottleCommandResponse } from './core/usecases/throttle/throttle-command-response';

class RateLimitingManagerAuthorizationAndLoggerDecorator implements RateLimitingManager {
    constructor(private readonly manager: RateLimitingManager) {}

    @Log(msg('getting quota limits'))
    @Authorize(RateLimitingPermissions.GetQuotaLimits)
    async getQuotaLimits(
        query: OptionalProperties<GetQuotaLimitsQuery, 'userId'>,
    ): Promise<GetQuotaLimitsQueryResponse> {
        return await this.manager.getQuotaLimits({ ...query, userId: query.session.user.id });
    }

    @Log(msg('getting quota limits'))
    @Authorize(RateLimitingPermissions.ChangeQuotaLimits)
    async changeQuotaLimits(
        command: ChangeQuotaLimitsCommand,
    ): Promise<ChangeQuotaLimitsCommandResponse> {
        return await this.manager.changeQuotaLimits(command);
    }

    @Log(msg('getting quota summary'))
    @Authorize(RateLimitingPermissions.GetQuotaSummary)
    async getQuotaSummary(
        query: OptionalProperties<GetQuotaSummaryQuery, 'userId'>,
    ): Promise<GetQuotaSummaryQueryResponse> {
        return await this.manager.getQuotaSummary({ ...query, userId: query.session.user.id });
    }

    async throttle(command: ThrottleCommand): Promise<ThrottleCommandResponse> {
        return await this.manager.throttle(command);
    }
}

function msg(str: string): string {
    return GetComponentActionLogMessage('rate limiting manager', str);
}

export { RateLimitingManagerAuthorizationAndLoggerDecorator };
