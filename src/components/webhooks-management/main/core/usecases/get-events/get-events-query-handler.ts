import { QueryHandler } from '@lib/primitives/generic/cqrs/query-handler';
import { GetEventsQuery } from './get-events-query';
import { GetEventsQueryResponse } from './get-events-query-response';

import { SupportedEvents } from '../../domain/supported-events';

class GetEventsQueryHandler implements QueryHandler<GetEventsQuery, GetEventsQueryResponse> {
    async handle(query: GetEventsQuery): Promise<GetEventsQueryResponse> {
        const result: GetEventsQueryResponse = {
            names: [],
            docs: [],
        };

        for (const name of Object.keys(SupportedEvents)) {
            if (query.search) {
                if (!name.toLowerCase().includes(query.search.toLowerCase())) continue;
            }

            result.names.push(name);
            result.docs.push(SupportedEvents[name]);
        }

        return result;
    }
}

export { GetEventsQueryHandler };
