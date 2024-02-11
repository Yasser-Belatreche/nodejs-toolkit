import { IsEmpty } from '@lib/primitives/generic/helpers/is-empty';
import { GenerateUuid } from '@lib/primitives/generic/helpers/generate-uuid';
import { GenerateUnique } from '@lib/primitives/generic/helpers/generate-unique';
import { IsValidHttpUrl } from '@lib/primitives/generic/helpers/is-valid-http-url';

import { EventName, EventNames } from './event-name';
import { ValidationException } from './exceptions/validation-exception';

export interface Webhook {
    id: string;
    assigneeId: string;
    secret: string;
    deliveryUrl: string;
    events: EventName[];
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const CreateWebhook = async (
    assigneeId: string,
    deliveryUrl: string,
    events: string[],
    by: string,
): Promise<Webhook> => {
    if (IsEmpty(events)) throw new ValidationException('EMPTY_EVENTS', 'Events cannot be empty');

    for (const event of events) {
        if (!EventNames.includes(event as EventName)) {
            throw new ValidationException('INVALID_EVENT', `Event ${event} is invalid`, { event });
        }
    }

    if (!IsValidHttpUrl(deliveryUrl, { secure: true }))
        throw new ValidationException(
            'INVALID_DELIVERY_URL',
            'The delivery url should be a valid https url',
        );

    return {
        id: GenerateUuid(),
        assigneeId,
        deliveryUrl,
        events: events as EventName[],
        createdBy: by,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        secret: await GenerateUnique(30),
    };
};

const EditWebhook = (webhook: Webhook, events: string[], deliveryUrl: string): Webhook => {
    if (IsEmpty(events)) throw new ValidationException('EMPTY_EVENTS', 'Events cannot be empty');

    for (const event of events) {
        if (!EventNames.includes(event as EventName)) {
            throw new ValidationException('INVALID_EVENT', `Event ${event} is invalid`, { event });
        }
    }

    if (!IsValidHttpUrl(deliveryUrl, { secure: true }))
        throw new ValidationException(
            'INVALID_DELIVERY_URL',
            'The delivery url should be a valid https url',
        );

    return {
        ...webhook,
        events: events as EventName[],
        deliveryUrl,
        updatedAt: new Date(),
    };
};

const DisableWebhook = (webhook: Webhook): Webhook => {
    if (!webhook.isActive)
        throw new ValidationException(
            'WEBHOOK_NOT_ACTIVE',
            `webhook ${webhook.id} is already disabled`,
            { id: webhook.id },
        );

    return {
        ...webhook,
        isActive: false,
        updatedAt: new Date(),
    };
};

const EnableWebhook = (webhook: Webhook): Webhook => {
    if (webhook.isActive)
        throw new ValidationException(
            'WEBHOOK_ACTIVE',
            `webhook ${webhook.id} is already enabled`,
            { id: webhook.id },
        );

    return {
        ...webhook,
        isActive: true,
        updatedAt: new Date(),
    };
};

export { CreateWebhook, EditWebhook, DisableWebhook, EnableWebhook };
