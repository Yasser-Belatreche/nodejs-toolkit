import { QueryHandler } from '@lib/primitives/generic/cqrs/query-handler';
import { GetWebhooksQuery } from './get-webhooks-query';
import { GetWebhooksQueryResponse } from './get-webhooks-query-response';

// import { getPageAndPerPage, getPagination } from '@lib/primitives/application-specific/pagination';
import { DeveloperException } from '@lib/primitives/application-specific/exceptions/developer-exception';

class GetWebhooksQueryHandler implements QueryHandler<GetWebhooksQuery, GetWebhooksQueryResponse> {
    async handle(query: GetWebhooksQuery): Promise<GetWebhooksQueryResponse> {
        throw new DeveloperException('NOT_IMPLEMENTED', 'this use case is not implemented yet');

        // const { page, perPage, totalToSkip } = getPageAndPerPage(query);
        //
        // return {
        //     list: [],
        //     pagination: getPagination(page, perPage, total),
        // };
    }
}

export { GetWebhooksQueryHandler };
