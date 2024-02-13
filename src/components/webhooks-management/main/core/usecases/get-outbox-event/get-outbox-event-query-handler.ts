import { QueryHandler } from '@lib/primitives/generic/cqrs/query-handler';
import { GetOutboxEventQuery } from './get-outbox-event-query';
import { GetOutboxEventQueryResponse } from './get-outbox-event-query-response';

import { OutboxEventRepository } from '../../domain/outbox-event-repository';

import { NotFoundException } from '../../domain/exceptions/not-found-exception';

class GetOutboxEventQueryHandler
    implements QueryHandler<GetOutboxEventQuery, GetOutboxEventQueryResponse>
{
    constructor(private readonly repository: OutboxEventRepository) {}

    async handle(query: GetOutboxEventQuery): Promise<GetOutboxEventQueryResponse> {
        const outbox = await this.repository.ofId(query.id);

        if (!outbox)
            throw new NotFoundException(
                'OUTBOX_EVENT',
                `Outbox event with id ${query.id} not found`,
                { id: query.id },
            );

        return outbox;
    }
}

export { GetOutboxEventQueryHandler };
