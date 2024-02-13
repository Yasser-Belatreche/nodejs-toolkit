import { QueryHandler } from '@lib/primitives/generic/cqrs/query-handler';
import { GetWebhookQuery } from './get-webhook-query';
import { GetWebhookQueryResponse } from './get-webhook-query-response';

import { WebhookRepository } from '../../domain/webhook-repository';
import { NotFoundException } from '../../domain/exceptions/not-found-exception';

class GetWebhookQueryHandler implements QueryHandler<GetWebhookQuery, GetWebhookQueryResponse> {
    constructor(private readonly repository: WebhookRepository) {}

    async handle(query: GetWebhookQuery): Promise<GetWebhookQueryResponse> {
        const webhook = await this.repository.ofId(query.id);

        if (!webhook)
            throw new NotFoundException('WEBHOOK', `Webhook with id ${query.id} not found`, {
                id: query.id,
            });

        return webhook;
    }
}

export { GetWebhookQueryHandler };
