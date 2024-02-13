import { Event } from './event';
import { ValidationException } from './exceptions/validation-exception';
import { GenerateSignature } from './generate-signature';
import {
    CanRetryOutboxEvent,
    CreateOutboxEvent,
    OutboxEvent,
    OutboxEventDelivered,
    OutboxEventDeliveryFailed,
} from './outbox-event';
import { Webhook } from './webhook';
import { RestClient } from './rest-client';
import { OutboxEventRepository } from './outbox-event-repository';

const SendWebhookEvent = async (
    webhook: Webhook,
    event: Event,
    isTest: boolean,
    restClient: RestClient,
    repository: OutboxEventRepository,
): Promise<OutboxEvent> => {
    let result: OutboxEvent;

    const outbox = CreateOutboxEvent(webhook, event, isTest);

    await repository.create(outbox);

    const { response, status } = await restClient.post(webhook.deliveryUrl, event, {
        'X-Webhook-Id': webhook.id,
        'X-Webhook-Signature': GenerateSignature(webhook.secret, event),
        'X-Webhook-Trigger': event.name,
        'Content-Type': 'application/json',
    });

    if (status === 200 || status === 201) {
        const delivered = OutboxEventDelivered(outbox, status, response);

        result = delivered;

        await repository.update(delivered);
    } else {
        const failed = OutboxEventDeliveryFailed(outbox, status, response);

        result = failed;

        await repository.update(failed);
    }

    return result;
};

const RetryOutboxEvent = async (
    outbox: OutboxEvent,
    restClient: RestClient,
    repository: OutboxEventRepository,
): Promise<OutboxEvent> => {
    if (!CanRetryOutboxEvent(outbox))
        throw new ValidationException(
            'CANNOT_RETRY_OUTBOX_EVENT',
            `outbox event with id ${outbox.id} cannot be retried`,
            { outboxEventId: outbox.id },
        );

    const event = outbox.event;

    const { response, status } = await restClient.post(outbox.deliveryUrl, event, {
        'X-Webhook-Id': outbox.webhookId,
        'X-Webhook-Signature': GenerateSignature(outbox.webhookSecret, event),
        'X-Webhook-Trigger': event.name,
        'Content-Type': 'application/json',
    });

    if (status === 200 || status === 201) {
        const delivered = OutboxEventDelivered(outbox, status, response);

        await repository.update(delivered);

        return delivered;
    } else {
        const failed = OutboxEventDeliveryFailed(outbox, status, response);

        await repository.update(failed);

        return failed;
    }
};

export { SendWebhookEvent, RetryOutboxEvent };
