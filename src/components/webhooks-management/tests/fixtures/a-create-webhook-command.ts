import { faker } from '@faker-js/faker';

import { CreateWebhookCommand } from '../../main/core/usecases/create-webhook/create-webhook-command';

const aCreateWebhookCommand = (overr?: Partial<CreateWebhookCommand>): CreateWebhookCommand => ({
    assigneeId: faker.string.uuid(),
    deliveryUrl: faker.internet.url(),
    events: [],
    session: { correlationId: faker.string.uuid(), user: { id: faker.string.uuid() } } as any,

    ...overr,
});

export { aCreateWebhookCommand };
