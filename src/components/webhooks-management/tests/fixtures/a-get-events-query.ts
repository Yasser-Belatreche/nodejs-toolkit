import { GetEventsQuery } from '../../main/core/usecases/get-events/get-events-query';
import { faker } from '@faker-js/faker';

const aGetEventsQuery = (overr?: Partial<GetEventsQuery>): GetEventsQuery => {
    return {
        ...overr,
        session: { correlationId: faker.string.uuid(), user: { id: faker.string.uuid() } } as any,
    };
};

export { aGetEventsQuery };
