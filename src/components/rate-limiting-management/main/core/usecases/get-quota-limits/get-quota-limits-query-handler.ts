import { QueryHandler } from '@lib/primitives/generic/cqrs/query-handler';
import { GetQuotaLimitsQuery } from './get-quota-limits-query';
import { GetQuotaLimitsQueryResponse } from './get-quota-limits-query-response';

import { defaultQuotaLimits } from '../../domain/quota-limits';
import { QuotaLimitsRepository } from '../../domain/quota-limits-repository';

class GetQuotaLimitsQueryHandler
    implements QueryHandler<GetQuotaLimitsQuery, GetQuotaLimitsQueryResponse>
{
    constructor(private readonly repository: QuotaLimitsRepository) {}

    async handle(query: GetQuotaLimitsQuery): Promise<GetQuotaLimitsQueryResponse> {
        const quotaLimits = await this.repository.ofUser(query.userId, query.session);

        return quotaLimits ?? defaultQuotaLimits;
    }
}

export { GetQuotaLimitsQueryHandler };
