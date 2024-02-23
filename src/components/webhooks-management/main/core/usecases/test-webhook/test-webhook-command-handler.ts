import { CommandHandler } from '@lib/primitives/generic/cqrs/command-handler';
import { TestWebhookCommand } from './test-webhook-command';
import { TestWebhookCommandResponse } from './test-webhook-command-response';

import { SendEventToWebhook } from '../../domain/send-webhook-event';
import { GenerateTestEvent, SupportedEvents } from '../../domain/supported-events';

import { NotFoundException } from '../../domain/exceptions/not-found-exception';

import { RestClient } from '../../domain/rest-client';
import { WebhookRepository } from '../../domain/webhook-repository';
import { OutboxEventRepository } from '../../domain/outbox-event-repository';

class TestWebhookCommandHandler
    implements CommandHandler<TestWebhookCommand, TestWebhookCommandResponse>
{
    constructor(
        private readonly restClient: RestClient,
        private readonly webhookRespository: WebhookRepository,
        private readonly outboxEventRespoitory: OutboxEventRepository,
    ) {}

    async execute(command: TestWebhookCommand): Promise<TestWebhookCommandResponse> {
        const webhook = await this.webhookRespository.ofId(command.id);

        if (!webhook)
            throw new NotFoundException('WEBHOOK', `Webhook with id ${command.id} not found`, {
                id: command.id,
            });

        const outboxEvents: string[] = [];

        for (const eventName of webhook.events) {
            const testEvent = GenerateTestEvent(SupportedEvents[eventName]);

            testEvent.name = eventName;

            const outboxEvent = await SendEventToWebhook(
                webhook,
                testEvent,
                true,
                this.restClient,
                this.outboxEventRespoitory,
            );

            outboxEvents.push(outboxEvent.id);
        }

        return { id: command.id, outboxEvents };
    }
}

export { TestWebhookCommandHandler };
