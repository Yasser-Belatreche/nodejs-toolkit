import { SessionCorrelationId } from '@lib/primitives/application-specific/session';
import { Event, UniversalEventHandler } from '@lib/messages-broker/main/messages-broker';

import { SendEventToWebhooks } from '../domain/send-webhook-event';

import { RestClient } from '../domain/rest-client';
import { WebhookRepository } from '../domain/webhook-repository';
import { OutboxEventRepository } from '../domain/outbox-event-repository';

class AllEventsHandler extends UniversalEventHandler {
    constructor(
        private readonly restClient: RestClient,
        private readonly webhookRespository: WebhookRepository,
        private readonly outboxEventRespoitory: OutboxEventRepository,
    ) {
        super('webhooks manager');
    }

    async handle(event: Event<any>, session: SessionCorrelationId): Promise<void> {
        const webhooks = await this.webhookRespository.ofEvent(event.name);

        await SendEventToWebhooks(
            webhooks,
            event,
            false,
            this.restClient,
            this.outboxEventRespoitory,
        );
    }

    config(): { readonly retries: number } {
        return { retries: 0 };
    }
}

export { AllEventsHandler };
