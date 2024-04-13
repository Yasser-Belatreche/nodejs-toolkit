import {
    Event,
    UniversalEventHandler,
} from '@lib/messages-broker/main/events-broker/events-broker';
import { Log } from '@lib/logger/main/log-decorator';
import { SessionCorrelationId } from '@lib/primitives/application-specific/session';
import { GetEventHandlerLogMessage } from '@lib/primitives/application-specific/consistency/log-messages';

import { SendEventToWebhooks } from '../domain/send-webhook-event';

import { RestClient } from '../domain/rest-client';
import { WebhookRepository } from '../domain/webhook-repository';
import { OutboxEventRepository } from '../domain/outbox-event-repository';

class AllEventsHandler extends UniversalEventHandler {
    constructor(
        private readonly restClient: RestClient,
        private readonly webhookRepository: WebhookRepository,
        private readonly outboxEventRepository: OutboxEventRepository,
    ) {
        super('webhooks manager');
    }

    @Log(
        GetEventHandlerLogMessage(
            'webhooks manager',
            AllEventsHandler.name,
            'sending event to target webhooks',
        ),
    )
    async handle(event: Event<any>, session: SessionCorrelationId): Promise<void> {
        const webhooks = await this.webhookRepository.ofEvent(event.name);

        await SendEventToWebhooks(
            webhooks,
            event,
            false,
            this.restClient,
            this.outboxEventRepository,
        );
    }

    config(): { readonly retries: number } {
        return { retries: 0 };
    }
}

export { AllEventsHandler };
