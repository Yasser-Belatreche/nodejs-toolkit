import { QueryHandler } from '@lib/primitives/generic/cqrs/query-handler';
import { GetQuotaSummaryQuery } from './get-quota-summary-query';
import { GetQuotaSummaryQueryResponse } from './get-quota-summary-query-response';

import { RateLimitingAlgorithm } from '../../domain/rate-limiting-algorithm';
import { GetQuotaLimitsQueryHandler } from '../get-quota-limits/get-quota-limits-query-handler';

class GetQuotaSummaryQueryHandler
    implements QueryHandler<GetQuotaSummaryQuery, GetQuotaSummaryQueryResponse>
{
    constructor(
        private readonly algorithm: RateLimitingAlgorithm,
        private readonly limitsQuery: GetQuotaLimitsQueryHandler,
    ) {}

    async handle(query: GetQuotaSummaryQuery): Promise<GetQuotaSummaryQueryResponse> {
        const limits = await this.limitsQuery.handle({
            userId: query.userId,
            session: query.session,
        });

        const summary = await this.algorithm.quota(query.userId, query.token, limits);

        return summary;
    }
}

export { GetQuotaSummaryQueryHandler };
