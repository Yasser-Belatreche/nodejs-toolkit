import { faker } from '@faker-js/faker';
import { GetWebhookQuery } from '../../main/core/usecases/get-webhook/get-webhook-query';

const aGetWebhookQuery = (overr?: Partial<GetWebhookQuery>): GetWebhookQuery => {
    return {
        id: faker.string.uuid(),
        ...overr,
    };
};

export { aGetWebhookQuery };
