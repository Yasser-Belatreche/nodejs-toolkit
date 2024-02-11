import { faker } from '@faker-js/faker';
import { DeleteWebhookCommand } from '../../main/core/usecases/delete-webhook/delete-webhook-command';

const aDeleteWebhookCommand = (overr?: Partial<DeleteWebhookCommand>): DeleteWebhookCommand => {
    return {
        id: faker.string.uuid(),
        ...overr,
    };
};

export { aDeleteWebhookCommand };
