import { GenerateUuid } from '@lib/primitives/generic/helpers/generate-uuid';

import { Event } from './event';
import { Webhook } from './webhook';
import { ValidationException } from './exceptions/validation-exception';

export interface OutboxEvent {
    id: string;
    webhookId: string;
    assigneeId: string;
    webhookSecret: string;
    deliveryUrl: string;
    event: Event;

    status: 'pending' | 'delivered' | 'failed' | 'cancelled';

    nextTryAt: Date | null;

    tries: number;
    firstTryAt: Date | null;
    lastTryAt: Date | null;
    lastStatusCode: number | null;
    lastResponse: string | null;

    isTest: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const CreateOutboxEvent = (webhook: Webhook, event: Event, isTest: boolean): OutboxEvent => {
    if (!webhook.events.find(e => e === event.name))
        throw new ValidationException(
            'WEBHOOK_EVENT_NOT_SUPPORTED',
            `Webhook with id ${webhook.id} does not support event ${event.name}`,
            { webhookId: webhook.id, eventName: event.name },
        );

    return {
        id: GenerateUuid(),
        webhookId: webhook.id,
        assigneeId: webhook.assigneeId,
        deliveryUrl: webhook.deliveryUrl,
        webhookSecret: webhook.secret,
        event,
        status: 'pending',
        nextTryAt: new Date(),
        tries: 0,
        firstTryAt: null,
        lastTryAt: null,
        lastStatusCode: null,
        lastResponse: null,
        isTest,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
};

const OutboxEventDelivered = (outbox: OutboxEvent, status: number, response: any): OutboxEvent => {
    return {
        ...outbox,
        tries: outbox.tries + 1,
        status: 'delivered',
        firstTryAt: outbox.firstTryAt ?? new Date(),
        lastTryAt: new Date(),
        nextTryAt: null,
        lastStatusCode: status,
        lastResponse: JSON.stringify(response),
        updatedAt: new Date(),
    };
};

const OutboxEventDeliveryFailed = (
    outbox: OutboxEvent,
    status: number,
    response: any,
): OutboxEvent => {
    const tries = outbox.tries + 1;
    const nextTryAt = getNextTryAt(tries);

    return {
        ...outbox,
        tries,
        status: nextTryAt ? 'failed' : 'cancelled',
        firstTryAt: outbox.firstTryAt ?? new Date(),
        lastTryAt: new Date(),
        nextTryAt,
        lastStatusCode: status,
        lastResponse: JSON.stringify(response),
        updatedAt: new Date(),
    };
};

const CanRetryOutboxEvent = (outbox: OutboxEvent): boolean => {
    if (outbox.status === 'cancelled') return false;
    if (outbox.status === 'delivered') return false;

    if (outbox.status === 'pending') return true;

    const reachedMaxTries = outbox.tries > MAX_RETRIES;
    const nextTryTimeHasPassed = !!outbox.nextTryAt && outbox.nextTryAt.getTime() <= Date.now();

    return !reachedMaxTries && nextTryTimeHasPassed;
};

const getNextTryAt = (tries: number): Date | null => {
    switch (tries) {
        case 0: // now
            return new Date();
        case 1: // after 5 minutes
            return new Date(Date.now() + 1000 * 60 * 5);
        case 2: // after 30 minutes
            return new Date(Date.now() + 1000 * 60 * 30);
        case 3: // after 2 hours
            return new Date(Date.now() + 1000 * 60 * 60 * 2);
        case 4: // after 6 hours
            return new Date(Date.now() + 1000 * 60 * 60 * 6);
        case 5: // after 12 hours
            return new Date(Date.now() + 1000 * 60 * 60 * 12);
        case 6: // after 24 hours
            return new Date(Date.now() + 1000 * 60 * 60 * 24);
        default:
            return null;
    }
};

const MAX_RETRIES = 7;

export { OutboxEventDelivered, OutboxEventDeliveryFailed, CreateOutboxEvent, CanRetryOutboxEvent };
