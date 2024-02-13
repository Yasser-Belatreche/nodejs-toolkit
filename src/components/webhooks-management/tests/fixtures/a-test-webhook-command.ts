import { faker } from '@faker-js/faker';
import { TestWebhookCommand } from '../../main/core/usecases/test-webhook/test-webhook-command';

const aTestWebhookCommand = (overr?: Partial<TestWebhookCommand>): TestWebhookCommand => {
    return {
        id: faker.string.uuid(),
        ...overr,
    };
};

export { aTestWebhookCommand };
