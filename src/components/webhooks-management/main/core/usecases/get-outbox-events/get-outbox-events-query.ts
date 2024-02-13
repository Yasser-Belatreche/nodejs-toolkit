import { PaginatedQuery } from '@lib/primitives/application-specific/base-query';

export interface GetOutboxEventsQuery extends PaginatedQuery {
    id?: string[];
    webhook?: string[];
    assigneeId?: string[];
}
