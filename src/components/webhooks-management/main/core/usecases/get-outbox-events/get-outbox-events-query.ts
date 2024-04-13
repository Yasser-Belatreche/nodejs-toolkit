import { ProtectedPaginatedQuery } from '@lib/primitives/application-specific/query';

export interface GetOutboxEventsQuery extends ProtectedPaginatedQuery {
    id?: string[];
    webhook?: string[];
    assigneeId?: string[];
}
