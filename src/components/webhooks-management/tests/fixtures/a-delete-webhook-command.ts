import { faker } from '@faker-js/faker';
import { DeleteWebhookCommand } from '../../main/core/usecases/delete-webhook/delete-webhook-command';

const aDeleteWebhookCommand = (overr?: Partial<DeleteWebhookCommand>): DeleteWebhookCommand => {
    return {
        id: faker.string.uuid(),
        session: { correlationId: faker.string.uuid(), user: { id: faker.string.uuid() } } as any,
        ...overr,
    };
};

export { aDeleteWebhookCommand };
