import { PaginatedQuery } from '@lib/primitives/application-specific/base-query';

export interface GetWebhooksQuery extends PaginatedQuery {
    id?: string[];
    assigneeId?: string[];
    event?: string[];
}
