import { faker } from '@faker-js/faker';
import { TestWebhookCommand } from '../../main/core/usecases/test-webhook/test-webhook-command';

const aTestWebhookCommand = (overr?: Partial<TestWebhookCommand>): TestWebhookCommand => {
    return {
        id: faker.string.uuid(),
        session: { correlationId: faker.string.uuid(), user: { id: faker.string.uuid() } } as any,
        ...overr,
    };
};

export { aTestWebhookCommand };
