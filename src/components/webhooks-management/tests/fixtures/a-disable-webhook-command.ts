import { faker } from '@faker-js/faker';
import { DisableWebhookCommand } from '../../main/core/usecases/disable-webhook/disable-webhook-command';

const aDisableWebhookCommand = (overr?: Partial<DisableWebhookCommand>): DisableWebhookCommand => {
    return {
        id: faker.string.uuid(),
        session: { correlationId: faker.string.uuid(), user: { id: faker.string.uuid() } } as any,
        ...overr,
    };
};

export { aDisableWebhookCommand };
