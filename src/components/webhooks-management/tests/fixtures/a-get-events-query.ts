import { GetEventsQuery } from '../../main/core/usecases/get-events/get-events-query';

const aGetEventsQuery = (overr?: Partial<GetEventsQuery>): GetEventsQuery => {
    return { ...overr };
};

export { aGetEventsQuery };
