import { faker } from '@faker-js/faker';

import { EditWebhookCommand } from '../../main/core/usecases/edit-webhook/edit-webhook-command';

const anEditWebhookCommand = (overr?: Partial<EditWebhookCommand>): EditWebhookCommand => ({
    id: faker.string.uuid(),
    deliveryUrl: faker.internet.url(),
    events: [],

    ...overr,
});

export { anEditWebhookCommand };
