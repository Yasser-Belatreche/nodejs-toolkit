import { faker } from '@faker-js/faker';
import { EnableWebhookCommand } from '../../main/core/usecases/enable-webhook/enable-webhook-command';

const anEnableWebhookCommand = (overr?: Partial<EnableWebhookCommand>): EnableWebhookCommand => {
    return {
        id: faker.string.uuid(),
        session: { correlationId: faker.string.uuid(), user: { id: faker.string.uuid() } } as any,
        ...overr,
    };
};

export { anEnableWebhookCommand };
