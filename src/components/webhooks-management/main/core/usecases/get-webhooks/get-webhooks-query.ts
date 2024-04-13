import { ProtectedPaginatedQuery } from '@lib/primitives/application-specific/query';

export interface GetWebhooksQuery extends ProtectedPaginatedQuery {
    id?: string[];
    assigneeId?: string[];
    event?: string[];
}
