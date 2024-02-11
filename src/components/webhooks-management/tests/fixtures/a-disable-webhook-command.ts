import { faker } from '@faker-js/faker';
import { DisableWebhookCommand } from '../../main/core/usecases/disable-webhook/disable-webhook-command';

const aDisableWebhookCommand = (overr?: Partial<DisableWebhookCommand>): DisableWebhookCommand => {
    return {
        id: faker.string.uuid(),
        ...overr,
    };
};

export { aDisableWebhookCommand };
