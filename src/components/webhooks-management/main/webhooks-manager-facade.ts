import { RestClient } from './core/domain/rest-client';
import { WebhookRepository } from './core/domain/webhook-repository';
import { OutboxEventRepository } from './core/domain/outbox-event-repository';

import { CreateWebhookCommand } from './core/usecases/create-webhook/create-webhook-command';
import { CreateWebhookCommandHandler } from './core/usecases/create-webhook/create-webhook-command-handler';
import { CreateWebhookCommandResponse } from './core/usecases/create-webhook/create-webhook-command-response';

import { DeleteWebhookCommand } from './core/usecases/delete-webhook/delete-webhook-command';
import { DeleteWebhookCommandHandler } from './core/usecases/delete-webhook/delete-webhook-command-handler';
import { DeleteWebhookCommandResponse } from './core/usecases/delete-webhook/delete-webhook-command-response';

import { DisableWebhookCommand } from './core/usecases/disable-webhook/disable-webhook-command';
import { DisableWebhookCommandHandler } from './core/usecases/disable-webhook/disable-webhook-command-handler';
import { DisableWebhookCommandResponse } from './core/usecases/disable-webhook/disable-webhook-command-response';

import { EditWebhookCommand } from './core/usecases/edit-webhook/edit-webhook-command';
import { EditWebhookCommandHandler } from './core/usecases/edit-webhook/edit-webhook-command-handler';
import { EditWebhookCommandResponse } from './core/usecases/edit-webhook/edit-webhook-command-response';

import { EnableWebhookCommand } from './core/usecases/enable-webhook/enable-webhook-command';
import { EnableWebhookCommandHandler } from './core/usecases/enable-webhook/enable-webhook-command-handler';
import { EnableWebhookCommandResponse } from './core/usecases/enable-webhook/enable-webhook-command-response';

import { GetEventsQuery } from './core/usecases/get-events/get-events-query';
import { GetEventsQueryHandler } from './core/usecases/get-events/get-events-query-handler';
import { GetEventsQueryResponse } from './core/usecases/get-events/get-events-query-response';

import { GetWebhookQuery } from './core/usecases/get-webhook/get-webhook-query';
import { GetWebhookQueryHandler } from './core/usecases/get-webhook/get-webhook-query-handler';
import { GetWebhookQueryResponse } from './core/usecases/get-webhook/get-webhook-query-response';

import { TestWebhookCommand } from './core/usecases/test-webhook/test-webhook-command';
import { TestWebhookCommandHandler } from './core/usecases/test-webhook/test-webhook-command-handler';
import { TestWebhookCommandResponse } from './core/usecases/test-webhook/test-webhook-command-response';

import { GetWebhooksQuery } from './core/usecases/get-webhooks/get-webhooks-query';
import { GetWebhooksQueryResponse } from './core/usecases/get-webhooks/get-webhooks-query-response';
import { GetWebhooksQueryHandler } from './core/usecases/get-webhooks/get-webhooks-query-handler';
import { GetOutboxEventQuery } from './core/usecases/get-outbox-event/get-outbox-event-query';
import { GetOutboxEventQueryResponse } from './core/usecases/get-outbox-event/get-outbox-event-query-response';
import { GetOutboxEventQueryHandler } from './core/usecases/get-outbox-event/get-outbox-event-query-handler';
import { GetOutboxEventsQuery } from './core/usecases/get-outbox-events/get-outbox-events-query';
import { GetOutboxEventsQueryResponse } from './core/usecases/get-outbox-events/get-outbox-events-query-response';
import { GetOutboxEventsQueryHandler } from './core/usecases/get-outbox-events/get-outbox-events-query-handler';

class WebhooksManagerFacade {
    constructor(
        private readonly restClient: RestClient,
        private readonly webhookRepository: WebhookRepository,
        private readonly outboxEventRepository: OutboxEventRepository,
    ) {}

    async createWebhook(command: CreateWebhookCommand): Promise<CreateWebhookCommandResponse> {
        return await new CreateWebhookCommandHandler(this.webhookRepository).execute(command);
    }

    async deleteWebhook(command: DeleteWebhookCommand): Promise<DeleteWebhookCommandResponse> {
        return await new DeleteWebhookCommandHandler(this.webhookRepository).execute(command);
    }

    async editWebhook(command: EditWebhookCommand): Promise<EditWebhookCommandResponse> {
        return await new EditWebhookCommandHandler(this.webhookRepository).execute(command);
    }

    async enableWebhook(command: EnableWebhookCommand): Promise<EnableWebhookCommandResponse> {
        return await new EnableWebhookCommandHandler(this.webhookRepository).execute(command);
    }

    async disableWebhook(command: DisableWebhookCommand): Promise<DisableWebhookCommandResponse> {
        return await new DisableWebhookCommandHandler(this.webhookRepository).execute(command);
    }

    async testWebhook(command: TestWebhookCommand): Promise<TestWebhookCommandResponse> {
        return await new TestWebhookCommandHandler(
            this.restClient,
            this.webhookRepository,
            this.outboxEventRepository,
        ).execute(command);
    }

    async getWebhook(query: GetWebhookQuery): Promise<GetWebhookQueryResponse> {
        return await new GetWebhookQueryHandler(this.webhookRepository).handle(query);
    }

    async getWebhooks(query: GetWebhooksQuery): Promise<GetWebhooksQueryResponse> {
        return await new GetWebhooksQueryHandler().handle(query);
    }

    async getEvents(query: GetEventsQuery): Promise<GetEventsQueryResponse> {
        return await new GetEventsQueryHandler().handle(query);
    }

    async getOutboxEvent(query: GetOutboxEventQuery): Promise<GetOutboxEventQueryResponse> {
        return await new GetOutboxEventQueryHandler(this.outboxEventRepository).handle(query);
    }

    async getOutboxEvents(query: GetOutboxEventsQuery): Promise<GetOutboxEventsQueryResponse> {
        return await new GetOutboxEventsQueryHandler().handle(query);
    }
}

export { WebhooksManagerFacade };
