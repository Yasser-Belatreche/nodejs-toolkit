import { RateLimitingManager } from './rate-limiting-manager';

import { QuotaLimitsRepository } from './core/domain/quota-limits-repository';
import { RateLimitingAlgorithm } from './core/domain/rate-limiting-algorithm';

import { ThrottleCommand } from './core/usecases/throttle/throttle-command';
import { ThrottleCommandResponse } from './core/usecases/throttle/throttle-command-response';
import { ThrottleCommandHandler } from './core/usecases/throttle/throttle-command-handler';

import { GetQuotaLimitsQuery } from './core/usecases/get-quota-limits/get-quota-limits-query';
import { GetQuotaLimitsQueryHandler } from './core/usecases/get-quota-limits/get-quota-limits-query-handler';
import { GetQuotaLimitsQueryResponse } from './core/usecases/get-quota-limits/get-quota-limits-query-response';

import { ChangeQuotaLimitsCommand } from './core/usecases/change-quota-limits/change-quota-limits-command';
import { ChangeQuotaLimitsCommandResponse } from './core/usecases/change-quota-limits/change-quota-limits-command-response';
import { ChangeQuotaLimitsCommandHandler } from './core/usecases/change-quota-limits/change-quota-limits-command-handler';

import { GetQuotaSummaryQuery } from './core/usecases/get-quota-summary/get-quota-summary-query';
import { GetQuotaSummaryQueryResponse } from './core/usecases/get-quota-summary/get-quota-summary-query-response';
import { GetQuotaSummaryQueryHandler } from './core/usecases/get-quota-summary/get-quota-summary-query-handler';

class RateLimitingManagerFacade implements RateLimitingManager {
    constructor(
        private readonly algorithm: RateLimitingAlgorithm,
        private readonly quotaLimitsRepository: QuotaLimitsRepository,
    ) {}

    async throttle(command: ThrottleCommand): Promise<ThrottleCommandResponse> {
        return await new ThrottleCommandHandler(
            this.algorithm,
            new GetQuotaLimitsQueryHandler(this.quotaLimitsRepository),
        ).execute(command);
    }

    async changeQuotaLimits(
        command: ChangeQuotaLimitsCommand,
    ): Promise<ChangeQuotaLimitsCommandResponse> {
        return await new ChangeQuotaLimitsCommandHandler(this.quotaLimitsRepository).execute(
            command,
        );
    }

    async getQuotaLimits(query: GetQuotaLimitsQuery): Promise<GetQuotaLimitsQueryResponse> {
        return await new GetQuotaLimitsQueryHandler(this.quotaLimitsRepository).handle(query);
    }

    async getQuotaSummary(query: GetQuotaSummaryQuery): Promise<GetQuotaSummaryQueryResponse> {
        return await new GetQuotaSummaryQueryHandler(
            this.algorithm,
            new GetQuotaLimitsQueryHandler(this.quotaLimitsRepository),
        ).handle(query);
    }
}

export { RateLimitingManagerFacade };
