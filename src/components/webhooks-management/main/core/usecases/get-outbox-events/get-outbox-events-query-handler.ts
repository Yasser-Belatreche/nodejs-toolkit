import { QueryHandler } from '@lib/primitives/generic/cqrs/query-handler';
import { GetOutboxEventsQuery } from './get-outbox-events-query';
import { GetOutboxEventsQueryResponse } from './get-outbox-events-query-response';

// import { getPageAndPerPage, getPagination } from '@lib/primitives/application-specific/pagination';
import { DeveloperException } from '@lib/primitives/application-specific/exceptions/developer-exception';

class GetOutboxEventsQueryHandler
    implements QueryHandler<GetOutboxEventsQuery, GetOutboxEventsQueryResponse>
{
    async handle(query: GetOutboxEventsQuery): Promise<GetOutboxEventsQueryResponse> {
        throw new DeveloperException('NOT_IMPLEMENTED', 'this use case is not implemneted yet');

        // const { page, perPage, totalToSkip } = getPageAndPerPage(query);
        //
        // return {
        //     list: [],
        //     pagination: getPagination(page, perPage, total),
        // };
    }
}

export { GetOutboxEventsQueryHandler };
