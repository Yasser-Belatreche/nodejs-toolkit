import { faker } from '@faker-js/faker';
import { GetWebhookQuery } from '../../main/core/usecases/get-webhook/get-webhook-query';

const aGetWebhookQuery = (overr?: Partial<GetWebhookQuery>): GetWebhookQuery => {
    return {
        id: faker.string.uuid(),
        session: { correlationId: faker.string.uuid(), user: { id: faker.string.uuid() } } as any,
        ...overr,
    };
};

export { aGetWebhookQuery };
