import { faker } from '@faker-js/faker';

import { CreateWebhookCommand } from '../../main/core/usecases/create-webhook/create-webhook-command';

const aCreateWebhookCommand = (overr?: Partial<CreateWebhookCommand>): CreateWebhookCommand => ({
    assigneeId: faker.string.uuid(),
    deliveryUrl: faker.internet.url(),
    events: [],
    createdBy: faker.string.uuid(),

    ...overr,
});

export { aCreateWebhookCommand };
